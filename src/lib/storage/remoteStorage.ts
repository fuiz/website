import {
	addCreationLocal,
	generateUuid,
	getCreationLocal,
	updateCreationLocal,
	type InternalFuiz,
	type InternalFuizMetadata,
	type LocalDatabase,
	retrieveMediaFromLocal,
	updateLocalImagesDatabse,
	type CreationId,
	type StrictInternalFuizMetadata,
	type MediaReferencedFuizConfig
} from '.';
import { getMedia, type Media } from '../types';
import { bring, isNotUndefined } from '../util';

export interface RemoteSync {
	sync(
		localDatabase: IDBDatabase,
		creations: [CreationId, StrictInternalFuizMetadata][]
	): Promise<void>;

	create(uuid: string, internalFuiz: InternalFuiz): Promise<void>;
	get(uuid: string): Promise<MediaReferencedFuizConfig | undefined>;
	update(uuid: string, internalFuiz: InternalFuiz): Promise<void>;
	delete(uuid: string): Promise<void>;

	createImage(hash: string, value: string | Media): Promise<void>;
	getImage(hash: string): Promise<Media | string | undefined>;
}

export function retrieveRemoteSync(provider: 'database' | 'gdrive' = 'database'): RemoteSync {
	return provider === 'gdrive' ? new GoogleDriveSync() : new DatabaseSync();
}

export async function reconcile(
	remoteDatabase: RemoteSync,
	localDatabase: LocalDatabase,
	onRemote: InternalFuizMetadata[],
	hashOnRemote: (hash: string) => Promise<boolean>,
	onLocal: [CreationId, StrictInternalFuizMetadata][]
) {
	const getRemote = (() => {
		const ids: Map<string, InternalFuizMetadata> = new Map(
			onRemote
				.map((c) =>
					c.uniqueId ? ([c.uniqueId, c] satisfies [string, InternalFuizMetadata]) : undefined
				)
				.filter(isNotUndefined)
		);
		return (id: string) => {
			return ids.get(id);
		};
	})();

	const getLocal = (() => {
		const ids: Map<string, [CreationId, InternalFuizMetadata]> = new Map(
			onLocal
				.map(([key, c]) =>
					c.uniqueId
						? ([c.uniqueId, [key, c]] satisfies [string, [CreationId, InternalFuizMetadata]])
						: undefined
				)
				.filter(isNotUndefined)
		);
		return (id: string) => {
			return ids.get(id);
		};
	})();

	const onlyInRemote = onRemote.filter((c) => !c.uniqueId || getLocal(c.uniqueId) === undefined);
	const onlyInExisting = onLocal.filter(
		([, c]) => !c.uniqueId || getRemote(c.uniqueId) === undefined
	);
	const remoteNewer = onRemote
		.map((c) => {
			if (!c.uniqueId) return;
			const local = getLocal(c.uniqueId);
			if (!local) return;
			const [localKey, localInternal] = local;
			const localVersion = localInternal.versionId ?? 0;
			const remoteVersion = c.versionId ?? 0;
			return localVersion < remoteVersion
				? ([c, localKey] satisfies [InternalFuizMetadata, CreationId])
				: undefined;
		})
		.filter(isNotUndefined);
	const localNewer = onLocal.filter(([, c]) => {
		if (!c.uniqueId) return false;
		const remote = getRemote(c.uniqueId);
		return remote && (remote.versionId ?? 0) < (c.versionId ?? 0);
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
						return [mediaReference, media] satisfies [string, Media | string];
					}
					if ('HashReference' in mediaReference.Image) {
						const media = await remoteDatabase.getImage(mediaReference.Image.HashReference.hash);
						if (!media) return undefined;
						return [mediaReference.Image.HashReference.hash, media] satisfies [
							string,
							Media | string
						];
					}
					return undefined;
				}) ?? []
			)
		).filter(isNotUndefined);
		await Promise.all(
			references.map(async ([hash, media]) => {
				await updateLocalImagesDatabse(media, hash, localDatabase);
			})
		);
	}

	async function images(internal: InternalFuiz): Promise<[string, string | Media][]> {
		const references = (
			await Promise.all(
				internal?.config.slides.map(async (s) => {
					const mediaReference = getMedia(s);
					if (!mediaReference) return undefined;
					if (typeof mediaReference === 'string') {
						const media = await retrieveMediaFromLocal(mediaReference, localDatabase);
						if (!media) return undefined;

						return [mediaReference, media] satisfies [string, Media];
					}
					if ('HashReference' in mediaReference.Image) {
						const media = await retrieveMediaFromLocal(
							mediaReference.Image.HashReference.hash,
							localDatabase,
							mediaReference.Image.HashReference.alt
						);
						if (!media) return undefined;
						return [mediaReference.Image.HashReference.hash, media] as [string, Media];
					}
					return undefined;
				}) ?? []
			)
		).filter(isNotUndefined);
		return references.map(([hash, media]) => {
			return [hash, 'Base64' in media.Image ? media.Image.Base64.data : media];
		});
	}

	const filterNotExists = async (images: [string, string | Media][]) => {
		return (
			await Promise.all(
				images.map(
					async ([hash, media]) =>
						[hash, media, !(await hashOnRemote(hash))] satisfies [string, string | Media, boolean]
				)
			)
		)
			.filter(([, , exists]) => exists)
			.map(([hash, media]) => [hash, media] satisfies [string, string | Media]);
	};

	return await Promise.all([
		...onlyInRemote.map(async (c) => {
			if (!c.uniqueId) return;
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
			if (!c.uniqueId) return;
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
				await remoteDatabase.create(uniqueId, internal);
			}
		})
	]);
}

class DatabaseSync implements RemoteSync {
	async sync(
		localDatabase: LocalDatabase,
		existing: [CreationId, StrictInternalFuizMetadata][]
	): Promise<void> {
		const res = await bring(`/api/list`);
		if (!res?.ok) return;

		await reconcile(
			this,
			localDatabase,
			await res.json(),
			async (hash) => {
				const reqExists = await bring(`/api/existImage/${hash}`);
				if (!reqExists?.ok) return false;
				return await reqExists.json();
			},
			existing
		);
	}

	async get(uuid: string): Promise<MediaReferencedFuizConfig | undefined> {
		const res = await bring(`/api/get/${uuid}`);

		return res?.ok ? await res.json() : undefined;
	}

	async create(uuid: string, internalFuiz: InternalFuiz): Promise<void> {
		await fetch(`/api/create/${uuid}`, {
			method: 'POST',
			body: JSON.stringify(internalFuiz)
		});
	}

	async update(uuid: string, internalFuiz: InternalFuiz): Promise<void> {
		await fetch(`/api/update/${uuid}`, {
			method: 'POST',
			body: JSON.stringify(internalFuiz)
		});
	}

	async delete(uuid: string): Promise<void> {
		await fetch(`/api/delete/${uuid}`);
	}

	async createImage(hash: string, value: string | Media): Promise<void> {
		const reqExists = await bring(`/api/existImage/${hash}`);
		if (!reqExists?.ok || (await reqExists.json())) return undefined;
		const serialized = typeof value === 'string' ? value : JSON.stringify(value);
		await fetch(`/api/createImage`, {
			method: 'POST',
			body: serialized
		});
	}

	async getImage(hash: string): Promise<string | undefined> {
		const res = await bring(`/api/getImage/${hash}`);
		if (!res?.ok) return undefined;
		const media = await res.text();
		try {
			return JSON.parse(media);
		} catch {
			return media;
		}
	}
}

class GoogleDriveSync implements RemoteSync {
	async sync(
		localDatabase: LocalDatabase,
		existing: [CreationId, StrictInternalFuizMetadata][]
	): Promise<void> {
		const res = await bring(`/api/gdrive/list`);
		if (!res?.ok) return;

		await reconcile(
			this,
			localDatabase,
			await res.json(),
			async (hash) => {
				const reqExists = await bring(`/api/gdrive/existImage/${hash}`);
				if (!reqExists?.ok) return false;
				return await reqExists.json();
			},
			existing
		);
	}

	async get(uuid: string): Promise<MediaReferencedFuizConfig | undefined> {
		const res = await bring(`/api/gdrive/get/${uuid}`);

		return res?.ok ? await res.json() : undefined;
	}

	async create(uuid: string, internalFuiz: InternalFuiz): Promise<void> {
		await fetch(`/api/gdrive/create/${uuid}`, {
			method: 'POST',
			body: JSON.stringify(internalFuiz)
		});
	}

	async update(uuid: string, internalFuiz: InternalFuiz): Promise<void> {
		await fetch(`/api/gdrive/update/${uuid}`, {
			method: 'POST',
			body: JSON.stringify(internalFuiz)
		});
	}

	async delete(uuid: string): Promise<void> {
		await fetch(`/api/gdrive/delete/${uuid}`);
	}

	async createImage(hash: string, value: string | Media): Promise<void> {
		const reqExists = await bring(`/api/gdrive/existImage/${hash}`);
		if (!reqExists?.ok || (await reqExists.json())) return undefined;
		const serialized = typeof value === 'string' ? value : JSON.stringify(value);
		await fetch(`/api/gdrive/createImage`, {
			method: 'POST',
			body: serialized
		});
	}

	async getImage(hash: string): Promise<string | undefined> {
		const res = await bring(`/api/gdrive/getImage/${hash}`);
		if (!res?.ok) return undefined;
		const media = await res.text();
		try {
			return JSON.parse(media);
		} catch {
			return media;
		}
	}
}
