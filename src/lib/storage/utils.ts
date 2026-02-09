import {
	generateUuid,
	type InternalFuiz,
	type LocalDatabase,
	type CreationId,
	type InternalFuizMetadata
} from '.';
import {
	addCreationLocal,
	getCreationLocal,
	updateCreationLocal,
	retrieveMediaFromLocal,
	updateLocalImagesDatabase
} from './local';
import { getMedia, type Base64Media } from '../types';
import { isNotUndefined } from '../util';
import type { RemoteSync } from './interface';

export async function reconcile(
	remoteDatabase: RemoteSync,
	localDatabase: LocalDatabase,
	onRemote: InternalFuizMetadata[],
	hashOnRemote: (hash: string) => Promise<boolean>,
	onLocal: [CreationId, InternalFuizMetadata][]
) {
	const uniqueIdToRemoteFuiz: Map<string, InternalFuizMetadata> = new Map();
	for (const remote of onRemote) {
		const existing = uniqueIdToRemoteFuiz.get(remote.uniqueId);
		if (existing === undefined || remote.versionId > existing.versionId) {
			uniqueIdToRemoteFuiz.set(remote.uniqueId, remote);
		}
	}

	const getRemote = (id: string) => {
		return uniqueIdToRemoteFuiz.get(id);
	};

	const uniqueIdToLocalFuiz: Map<string, [CreationId, InternalFuizMetadata]> = new Map();
	for (const [key, local] of onLocal) {
		const existing = uniqueIdToLocalFuiz.get(local.uniqueId);
		if (existing === undefined || local.versionId > existing[1].versionId) {
			uniqueIdToLocalFuiz.set(local.uniqueId, [key, local]);
		}
	}

	const getLocal = (id: string) => {
		return uniqueIdToLocalFuiz.get(id);
	};

	const onlyInRemote = uniqueIdToRemoteFuiz
		.values()
		.filter((c) => getLocal(c.uniqueId) === undefined);
	const onlyInExisting = uniqueIdToLocalFuiz
		.values()
		.filter(([, c]) => getRemote(c.uniqueId) === undefined);
	const remoteNewer = uniqueIdToRemoteFuiz
		.values()
		.map((c) => {
			const local = getLocal(c.uniqueId);
			if (!local) return undefined;
			const [localKey, localInternal] = local;
			const localVersion = localInternal.versionId ?? 0;
			const remoteVersion = c.versionId ?? 0;
			return localVersion < remoteVersion
				? ([c, localKey] satisfies [InternalFuizMetadata, CreationId])
				: undefined;
		})
		.filter(isNotUndefined);
	const localNewer = uniqueIdToLocalFuiz.values().filter(([, c]) => {
		const remote = getRemote(c.uniqueId);
		return remote && remote.versionId < c.versionId;
	});

	async function updateLocalImages(internal: InternalFuiz) {
		const references = (
			await Promise.all(
				internal?.config.slides.map(async (s) => {
					const mediaReference = getMedia(s);
					if (!mediaReference) return undefined;
					if (typeof mediaReference === 'string') {
						const media = await remoteDatabase.getImage(mediaReference);
						if (!media) return undefined;
						return [mediaReference, media] satisfies [string, Base64Media];
					}
					if ('HashReference' in mediaReference.Image) {
						const media = await remoteDatabase.getImage(mediaReference.Image.HashReference.hash);
						if (!media) return undefined;
						return [mediaReference.Image.HashReference.hash, media] satisfies [string, Base64Media];
					}
					return undefined;
				}) ?? []
			)
		).filter(isNotUndefined);
		await Promise.all(
			references.map(async ([hash, media]) => {
				await updateLocalImagesDatabase(media, hash, localDatabase);
			})
		);
	}

	async function images(internal: InternalFuiz): Promise<[string, Base64Media][]> {
		return (
			await Promise.all(
				internal?.config.slides.map(async (s) => {
					const mediaReference = getMedia(s);
					if (!mediaReference) return undefined;
					if (typeof mediaReference === 'string') {
						const media = await retrieveMediaFromLocal(mediaReference, localDatabase);
						if (!media) return undefined;

						return [mediaReference, media] satisfies [string, Base64Media];
					}
					if ('HashReference' in mediaReference.Image) {
						const media = await retrieveMediaFromLocal(
							mediaReference.Image.HashReference.hash,
							localDatabase,
							mediaReference.Image.HashReference.alt
						);
						if (!media) return undefined;
						return [mediaReference.Image.HashReference.hash, media] as [string, Base64Media];
					}
					return undefined;
				}) ?? []
			)
		).filter(isNotUndefined);
	}

	const filterNotExists = async (images: [string, Base64Media][]) => {
		return (
			await Promise.all(
				images.map(
					async ([hash, media]) =>
						[hash, media, !(await hashOnRemote(hash))] satisfies [string, Base64Media, boolean]
				)
			)
		).filter(([, , exists]) => exists);
	};

	return await Promise.all([
		...onlyInRemote.map(async (c) => {
			const config = await remoteDatabase.get(c.uniqueId);
			if (!config) return;

			const internal: InternalFuiz = {
				...c,
				config
			};

			await updateLocalImages(internal);
			await addCreationLocal(internal, localDatabase);
		}),
		...onlyInExisting.map(async ([key]) => {
			const internal = await getCreationLocal(key, localDatabase);
			if (!internal) return;
			const uniqueId = internal.uniqueId ?? generateUuid();
			await updateCreationLocal(
				key,
				{
					...internal,
					uniqueId
				},
				localDatabase
			);
			await Promise.all(
				(await filterNotExists(await images(internal))).map(
					async ([hash, media]) => await remoteDatabase.createImage(hash, media)
				)
			);
			await remoteDatabase.create(uniqueId, internal);
		}),
		...remoteNewer.map(async ([c, localKey]) => {
			const config = await remoteDatabase.get(c.uniqueId);
			if (!config) return;

			const internal: InternalFuiz = {
				...c,
				config
			};

			await updateLocalImages(internal);
			await updateCreationLocal(localKey, internal, localDatabase);
		}),
		...localNewer.map(async ([key]) => {
			const internal = await getCreationLocal(key, localDatabase);
			if (!internal) return;
			const uniqueId = internal.uniqueId ?? generateUuid();
			await updateCreationLocal(
				key,
				{
					...internal,
					uniqueId
				},
				localDatabase
			);
			if (internal) {
				await Promise.all(
					(await filterNotExists(await images(internal))).map(
						async ([hash, media]) => await remoteDatabase.createImage(hash, media)
					)
				);
				await remoteDatabase.update(uniqueId, internal);
			}
		})
	]);
}
