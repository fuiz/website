import objectHash from 'object-hash';
import {
	type Base64Media,
	type Creation,
	type GenericIdlessFuizConfig,
	getMedia,
	type IdlessFullFuizConfig,
	type Media,
	type Modify,
	mapIdlessSlidesMedia,
	mapIdlessSlidesMediaSync
} from '../types';
import { toSorted } from '../util';
import {
	addCreationLocal,
	addReportLocal,
	deleteCreationLocal,
	deleteReportLocal,
	getAllCreationsLocal,
	getAllReportsLocal,
	getCreationLocal,
	getReportLocal,
	loadLocalDatabase,
	retrieveMediaFromLocal,
	updateCreationLocal,
	updateLocalImagesDatabase,
	updateReportLocal
} from './local';
import { type RemoteSync, type RemoteSyncProvider, retrieveRemoteSync } from './remoteStorage';

export type LocalDatabase = IDBDatabase;
export type CreationId = number;
export type ReportId = number;

/**
 * How a set of players performed in one hosted game.
 *
 * `fuizUniqueId` is the relational link back to the creation it was played from, but the
 * question titles are snapshotted alongside it: the quiz may be edited, deleted, or never
 * have been local at all (joined by code, opened from a share link), and the report still
 * has to render. `fuizVersionId` records which version was played so a later drift can be
 * flagged rather than silently misattributed.
 */
export type ReportBody = {
	title: string;
	playedAt: number;
	gameCode?: string;
	fuizUniqueId?: string;
	fuizVersionId?: number;
	playerCount: number;
	/**
	 * `pointsAwarded` is what the question could award at most. A report that
	 * omits it is read as scored, which fills every cell of its sheet.
	 */
	questions: { title: string; correct: number; wrong: number; pointsAwarded?: number }[];
	results: [string, number[]][];
	teams?: [string, string[]][];
	/**
	 * What each player actually said, one entry per question, in the slide's own
	 * phrasing: the picked option, the typed sentence, the slider value with its
	 * unit. Absent when no answers were captured, such as a game whose host never
	 * reached a results screen; an empty string means that player skipped that
	 * question.
	 *
	 * Kept beside `results` rather than folded into it because the two answer
	 * different questions: `results` is the gradebook, this is the response log.
	 */
	responses?: [string, string[]][];
};

export type InternalReport = ReportBody & InternalFuizMetadata;

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
	if (media === undefined) return undefined;
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
	if (media === undefined) return undefined;
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
	if (media === undefined) return undefined;
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

export async function syncRemote(database: Database): Promise<void> {
	await database.remote?.sync(
		database.local,
		(await getAllCreationsLocal(database.local)).map(([k, v]) => [parseInt(k.toString(), 10), v])
	);
}

export async function getLocalCreations(database: Database): Promise<Creation[]> {
	const internals = await getAllCreationsLocal(database.local);

	return await Promise.all(
		internals.map(async ([key, f]) => {
			const value = await collectFuiz(f, database.local);
			return {
				id: parseInt(key.toString(), 10),
				uniqueId: value.uniqueId,
				lastEdited: value.lastEdited,
				title: value.config.title,
				slidesCount: value.config.slides.length,
				media: value.config.slides.reduce<Media | undefined>((p, c) => p || getMedia(c), undefined)
			};
		})
	);
}

export async function getAllCreations(database: Database): Promise<Creation[]> {
	await syncRemote(database);
	return await getLocalCreations(database);
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

/** Resolves a report's `fuizUniqueId` back to the local creation, when it still exists. */
export async function findCreationByUniqueId(
	uniqueId: string,
	database: Database
): Promise<{ id: CreationId; versionId: number } | undefined> {
	const found = (await getAllCreationsLocal(database.local)).find(
		([, creation]) => creation.uniqueId === uniqueId
	);
	if (!found) return undefined;
	return { id: parseInt(found[0].toString(), 10), versionId: found[1].versionId };
}

export async function syncRemoteReports(database: Database): Promise<void> {
	await database.remote?.syncReports(database.local, await getAllReportsLocal(database.local));
}

export async function getLocalReports(database: Database): Promise<[ReportId, InternalReport][]> {
	return toSorted(
		await getAllReportsLocal(database.local),
		([, a], [, b]) => b.playedAt - a.playedAt
	);
}

export async function getAllReports(database: Database): Promise<[ReportId, InternalReport][]> {
	await syncRemoteReports(database);
	return await getLocalReports(database);
}

export async function getReport(
	id: ReportId,
	database: Database
): Promise<InternalReport | undefined> {
	return await getReportLocal(id, database.local);
}

/**
 * Svelte 5 wraps reactive values in a Proxy, and IndexedDB's structured clone throws
 * `DataCloneError` on one. Creations only avoid this by accident, because `internalizeFuiz`
 * rebuilds the config into fresh objects on the way in, but a report is stored exactly as
 * handed over, so it needs an explicit plain copy. A report is pure JSON data (strings,
 * numbers, arrays), so a round-trip is lossless apart from dropping `undefined` optionals,
 * which is what we want stored anyway.
 */
function plainCopy<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

export async function addReport(body: ReportBody, database: Database): Promise<ReportId> {
	const report: InternalReport = plainCopy({
		...body,
		uniqueId: generateUuid(),
		versionId: 0,
		lastEdited: Date.now()
	});
	const id = await addReportLocal(report, database.local);
	await database.remote?.createReport(report.uniqueId, report);
	return id;
}

/**
 * Returns the stored report so callers editing repeatedly keep a fresh `versionId` to build
 * on: reconcile() uses it as the sole conflict tiebreaker, so re-sending the same base
 * version would leave every edit after the first invisible to sync.
 */
export async function updateReport(
	id: ReportId,
	report: InternalReport,
	database: Database
): Promise<InternalReport> {
	const updated: InternalReport = plainCopy({
		...report,
		versionId: report.versionId + 1,
		lastEdited: Date.now()
	});
	await updateReportLocal(id, updated, database.local);
	await database.remote?.updateReport(updated.uniqueId, updated);
	return updated;
}

export async function deleteReport(id: ReportId, database: Database): Promise<void> {
	const uniqueId = (await getReportLocal(id, database.local))?.uniqueId;
	if (!uniqueId) return;
	await deleteReportLocal(id, database.local);
	await database.remote?.deleteReport(uniqueId);
}
