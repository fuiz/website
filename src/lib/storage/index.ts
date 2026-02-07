import objectHash from 'object-hash';
import {
	getMedia,
	mapIdlessSlidesMedia,
	mapIdlessSlidesMediaSync,
	type Base64Media,
	type Creation,
	type GenericIdlessFuizConfig,
	type IdlessFullFuizConfig,
	type Media,
	type Modify
} from '../types';
import { retrieveRemoteSync, type RemoteSync, type RemoteSyncProvider } from './remoteStorage';
import {
	addCreationLocal,
	deleteCreationLocal,
	getAllCreationsLocal,
	getCreationLocal,
	loadLocalDatabase,
	retrieveMediaFromLocal,
	updateCreationLocal,
	updateLocalImagesDatabase
} from './local';

export type LocalDatabase = IDBDatabase;
export type CreationId = number;

export type Database = {
	local: LocalDatabase;
	remote?: RemoteSync;
	availableProviders: Array<{ provider: RemoteSyncProvider; authenticated: boolean }>;
};

export type ExportedFuiz = {
	config: IdlessFullFuizConfig;
} & InternalFuizMetadata;

type MediaReference = {
	Image: {
		HashReference: {
			hash: string;
			alt: string;
		};
	};
};

type LooseMediaReference = Base64Media | MediaReference | string;

export type LooseMediaReferencedFuizConfig = GenericIdlessFuizConfig<
	LooseMediaReference | undefined
>;
export type MediaReferencedFuizConfig = GenericIdlessFuizConfig<MediaReference | undefined>;

export type LooseInternalFuiz = {
	config: LooseMediaReferencedFuizConfig;
} & LooseInternalFuizMetadata;

export type LooseInternalFuizMetadata = {
	lastEdited: number;
	uniqueId?: string;
	versionId?: number;
};

export type InternalFuiz = {
	config: MediaReferencedFuizConfig;
} & InternalFuizMetadata;

export type InternalFuizMetadata = Modify<
	LooseInternalFuizMetadata,
	{
		uniqueId: string;
		versionId: number;
	}
>;

export type InternalFuizMetadataStrings = Modify<
	InternalFuizMetadata,
	{
		lastEdited: string;
		versionId: string;
	}
>;

export function generateUuid(): string {
	return crypto.randomUUID();
}

function hashMedia(media: Base64Media): {
	hash: string;
	alt: string;
	dataUri: string;
} {
	const hash = media.Image.Base64.hash ?? objectHash(media.Image.Base64.data);
	return {
		hash,
		alt: media.Image.Base64.alt,
		dataUri: media.Image.Base64.data
	};
}

async function updateImagesDatabse(media: Base64Media, hash: string, database: Database) {
	if (await updateLocalImagesDatabase(media, hash, database.local)) {
		await database?.remote?.createImage(hash, media);
	}
}

async function internalizeMedia(
	media: Base64Media | undefined,
	database: Database
): Promise<MediaReference | undefined> {
	if (media == undefined) return undefined;
	const { hash, alt } = hashMedia(media);
	await updateImagesDatabse(media, hash, database);
	return {
		Image: {
			HashReference: {
				hash,
				alt
			}
		}
	};
}

async function internalizeFuiz(fuiz: ExportedFuiz, database: Database): Promise<InternalFuiz> {
	const internalizeMediaClosure = async (media: Base64Media | undefined) =>
		await internalizeMedia(media, database);
	return {
		...fuiz,
		config: await mapIdlessSlidesMedia(fuiz.config, internalizeMediaClosure)
	};
}

function coalesceMediaReference(
	media: LooseMediaReference | undefined
): MediaReference | undefined {
	if (media == undefined) return undefined;
	if (typeof media === 'string') {
		return {
			Image: {
				HashReference: {
					hash: media,
					alt: ''
				}
			}
		};
	}
	if ('Base64' in media.Image) {
		const { hash, alt } = hashMedia({ Image: media.Image });
		return {
			Image: {
				HashReference: {
					hash,
					alt
				}
			}
		};
	}
	return { Image: media.Image };
}

export function strictifyMediaReference(
	config: LooseMediaReferencedFuizConfig
): MediaReferencedFuizConfig {
	return mapIdlessSlidesMediaSync(config, coalesceMediaReference);
}

async function collectMedia(
	media: MediaReference | undefined,
	database: LocalDatabase
): Promise<Base64Media | undefined> {
	if (media == undefined) return undefined;
	if ('HashReference' in media.Image) {
		return await retrieveMediaFromLocal(
			media.Image.HashReference.hash,
			database,
			media.Image.HashReference.alt
		);
	}
	return {
		Image: media.Image
	};
}

async function collectFuiz(fuiz: InternalFuiz, database: LocalDatabase): Promise<ExportedFuiz> {
	const collectMediaClosure = async (media: MediaReference | undefined) =>
		await collectMedia(media, database);
	return {
		...fuiz,
		config: await mapIdlessSlidesMedia(fuiz.config, collectMediaClosure)
	};
}

export async function loadDatabase(): Promise<Database> {
	const local = await loadLocalDatabase();

	let remote: RemoteSync | undefined = undefined;
	let availableProviders: Array<{ provider: RemoteSyncProvider; authenticated: boolean }> = [];

	try {
		availableProviders = await retrieveRemoteSync();
		const authenticatedProvider = availableProviders.find((p) => p.authenticated);
		if (authenticatedProvider) {
			remote = new authenticatedProvider.provider();
		}
	} catch {
		// No remote sync if auth check fails
	}

	return {
		local,
		availableProviders,
		remote
	};
}

async function sync(database: Database) {
	await database.remote?.sync(
		database.local,
		(await getAllCreationsLocal(database.local)).map(([k, v]) => [parseInt(k.toString()), v])
	);
}

export async function getAllCreations(database: Database): Promise<Creation[]> {
	await sync(database);

	const internals = await getAllCreationsLocal(database.local);

	return await Promise.all(
		internals.map(async ([key, f]) => {
			const value = await collectFuiz(f, database.local);
			return {
				id: parseInt(key.toString()),
				lastEdited: value.lastEdited,
				title: value.config.title,
				slidesCount: value.config.slides.length,
				media: value.config.slides.reduce<Media | undefined>((p, c) => p || getMedia(c), undefined)
			};
		})
	);
}

export async function getCreation(
	id: CreationId,
	database: Database
): Promise<ExportedFuiz | undefined> {
	const internal = await getCreationLocal(id, database.local);
	return internal ? await collectFuiz(internal, database.local) : undefined;
}

export async function deleteCreation(id: CreationId, database: Database): Promise<void> {
	const uniqueId = (await getCreation(id, database))?.uniqueId;
	if (!uniqueId) return;
	await deleteCreationLocal(id, database.local);
	await database.remote?.delete(uniqueId);
}

export async function addCreation(newSlide: ExportedFuiz, database: Database): Promise<CreationId> {
	const internalFuiz = await internalizeFuiz(newSlide, database);
	const id = await addCreationLocal(internalFuiz, database.local);
	await database.remote?.create(newSlide.uniqueId, internalFuiz);
	return id;
}

export async function updateCreation(
	id: CreationId,
	newSlide: ExportedFuiz,
	database: Database
): Promise<void> {
	const internalFuiz = await internalizeFuiz(newSlide, database);
	await updateCreationLocal(id, internalFuiz, database.local);
	await database.remote?.update(newSlide.uniqueId, internalFuiz);
}
