import { type Base64Media, getMedia } from '../types';
import { isNotUndefined } from '../util';
import {
	generateUuid,
	type InternalFuiz,
	type InternalFuizMetadata,
	type InternalReport,
	type LocalDatabase,
	type MediaReferencedFuizConfig,
	type ReportBody
} from '.';
import type { RemoteSync } from './interface';
import {
	addCreationLocal,
	addReportLocal,
	getCreationLocal,
	getReportLocal,
	retrieveMediaFromLocal,
	updateCreationLocal,
	updateLocalImagesDatabase,
	updateReportLocal
} from './local';

/**
 * Everything `reconcile` needs to know about one kind of synced record. Creations carry
 * media and live in the `creations` store; reports carry none and live in `reports`.
 */
export type SyncEntity<TInternal extends InternalFuizMetadata, TBody> = {
	getLocal(key: number, database: LocalDatabase): Promise<TInternal | undefined>;
	addLocal(value: TInternal, database: LocalDatabase): Promise<number>;
	updateLocal(key: number, value: TInternal, database: LocalDatabase): Promise<void>;
	getRemote(remote: RemoteSync, uniqueId: string): Promise<TBody | undefined>;
	createRemote(remote: RemoteSync, uniqueId: string, value: TInternal): Promise<void>;
	updateRemote(remote: RemoteSync, uniqueId: string, value: TInternal): Promise<void>;
	compose(metadata: InternalFuizMetadata, body: TBody): TInternal;
	mediaReferences(value: TInternal): { hash: string; alt?: string }[];
};

export const creationEntity: SyncEntity<InternalFuiz, MediaReferencedFuizConfig> = {
	getLocal: getCreationLocal,
	addLocal: addCreationLocal,
	updateLocal: updateCreationLocal,
	getRemote: (remote, uniqueId) => remote.get(uniqueId),
	createRemote: (remote, uniqueId, value) => remote.create(uniqueId, value),
	updateRemote: (remote, uniqueId, value) => remote.update(uniqueId, value),
	compose: (metadata, config) => ({ ...metadata, config }),
	mediaReferences: (internal) =>
		internal.config.slides
			.map((slide) => {
				const mediaReference = getMedia(slide);
				if (!mediaReference) return undefined;
				if (typeof mediaReference === 'string') return { hash: mediaReference };
				if ('HashReference' in mediaReference.Image) {
					return {
						hash: mediaReference.Image.HashReference.hash,
						alt: mediaReference.Image.HashReference.alt
					};
				}
				return undefined;
			})
			.filter(isNotUndefined)
};

export const reportEntity: SyncEntity<InternalReport, ReportBody> = {
	getLocal: getReportLocal,
	addLocal: addReportLocal,
	updateLocal: updateReportLocal,
	getRemote: (remote, uniqueId) => remote.getReport(uniqueId),
	createRemote: (remote, uniqueId, value) => remote.createReport(uniqueId, value),
	updateRemote: (remote, uniqueId, value) => remote.updateReport(uniqueId, value),
	compose: (metadata, body) => ({ ...body, ...metadata }),
	mediaReferences: () => []
};

export async function reconcile<TInternal extends InternalFuizMetadata, TBody>(
	remoteDatabase: RemoteSync,
	localDatabase: LocalDatabase,
	onRemote: InternalFuizMetadata[],
	hashOnRemote: (hash: string) => Promise<boolean>,
	onLocal: [number, InternalFuizMetadata][],
	entity: SyncEntity<TInternal, TBody>
) {
	const uniqueIdToRemote: Map<string, InternalFuizMetadata> = new Map();
	for (const remote of onRemote) {
		const existing = uniqueIdToRemote.get(remote.uniqueId);
		if (existing === undefined || remote.versionId > existing.versionId) {
			uniqueIdToRemote.set(remote.uniqueId, remote);
		}
	}

	const getRemote = (id: string) => {
		return uniqueIdToRemote.get(id);
	};

	const uniqueIdToLocal: Map<string, [number, InternalFuizMetadata]> = new Map();
	for (const [key, local] of onLocal) {
		const existing = uniqueIdToLocal.get(local.uniqueId);
		if (existing === undefined || local.versionId > existing[1].versionId) {
			uniqueIdToLocal.set(local.uniqueId, [key, local]);
		}
	}

	const getLocal = (id: string) => {
		return uniqueIdToLocal.get(id);
	};

	const onlyInRemote = uniqueIdToRemote.values().filter((c) => getLocal(c.uniqueId) === undefined);
	const onlyInExisting = uniqueIdToLocal
		.values()
		.filter(([, c]) => getRemote(c.uniqueId) === undefined);
	const remoteNewer = uniqueIdToRemote
		.values()
		.map((c) => {
			const local = getLocal(c.uniqueId);
			if (!local) return undefined;
			const [localKey, localInternal] = local;
			const localVersion = localInternal.versionId ?? 0;
			const remoteVersion = c.versionId ?? 0;
			return localVersion < remoteVersion
				? ([c, localKey] satisfies [InternalFuizMetadata, number])
				: undefined;
		})
		.filter(isNotUndefined);
	const localNewer = uniqueIdToLocal.values().filter(([, c]) => {
		const remote = getRemote(c.uniqueId);
		return remote && remote.versionId < c.versionId;
	});

	async function updateLocalImages(internal: TInternal) {
		const references = (
			await Promise.all(
				entity.mediaReferences(internal).map(async ({ hash }) => {
					const media = await remoteDatabase.getImage(hash);
					if (!media) return undefined;
					return [hash, media] satisfies [string, Base64Media];
				})
			)
		).filter(isNotUndefined);
		await Promise.all(
			references.map(async ([hash, media]) => {
				await updateLocalImagesDatabase(media, hash, localDatabase);
			})
		);
	}

	async function images(internal: TInternal): Promise<[string, Base64Media][]> {
		return (
			await Promise.all(
				entity.mediaReferences(internal).map(async ({ hash, alt }) => {
					const media = await retrieveMediaFromLocal(hash, localDatabase, alt);
					if (!media) return undefined;
					return [hash, media] satisfies [string, Base64Media];
				})
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

	const pushImages = async (internal: TInternal) => {
		await Promise.all(
			(await filterNotExists(await images(internal))).map(
				async ([hash, media]) => await remoteDatabase.createImage(hash, media)
			)
		);
	};

	return await Promise.all([
		...onlyInRemote.map(async (c) => {
			const body = await entity.getRemote(remoteDatabase, c.uniqueId);
			if (!body) return;

			const internal = entity.compose(c, body);

			await updateLocalImages(internal);
			await entity.addLocal(internal, localDatabase);
		}),
		...onlyInExisting.map(async ([key]) => {
			const existing = await entity.getLocal(key, localDatabase);
			if (!existing) return;
			const uniqueId = existing.uniqueId ?? generateUuid();
			const internal = { ...existing, uniqueId };
			await entity.updateLocal(key, internal, localDatabase);
			await pushImages(internal);
			await entity.createRemote(remoteDatabase, uniqueId, internal);
		}),
		...remoteNewer.map(async ([c, localKey]) => {
			const body = await entity.getRemote(remoteDatabase, c.uniqueId);
			if (!body) return;

			const internal = entity.compose(c, body);

			await updateLocalImages(internal);
			await entity.updateLocal(localKey, internal, localDatabase);
		}),
		...localNewer.map(async ([key]) => {
			const existing = await entity.getLocal(key, localDatabase);
			if (!existing) return;
			const uniqueId = existing.uniqueId ?? generateUuid();
			const internal = { ...existing, uniqueId };
			await entity.updateLocal(key, internal, localDatabase);
			await pushImages(internal);
			await entity.updateRemote(remoteDatabase, uniqueId, internal);
		})
	]);
}
