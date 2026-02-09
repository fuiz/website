import type { Base64Media } from '$lib/types';
import {
	generateUuid,
	strictifyMediaReference,
	type CreationId,
	type LooseInternalFuiz,
	type LocalDatabase,
	type InternalFuiz
} from '.';

function strictifyInternalFuiz(internal: LooseInternalFuiz): InternalFuiz {
	return {
		...internal,
		config: strictifyMediaReference(internal.config),
		uniqueId: internal.uniqueId ?? generateUuid(),
		versionId: internal.versionId ?? 0
	};
}

export async function loadLocalDatabase(): Promise<LocalDatabase> {
	const request = indexedDB.open('FuizDB', 2);

	request.addEventListener('upgradeneeded', (event) => {
		const db = request.result;

		if (event.oldVersion !== 1) {
			db.createObjectStore('creations', { autoIncrement: true });
		}
		db.createObjectStore('images');
	});

	return await new Promise((resolve, reject) => {
		request.addEventListener('success', async () => {
			resolve(request.result);
		});
		request.addEventListener('error', reject);
	});
}

export async function retrieveMediaFromLocal(
	hash: string,
	database: LocalDatabase,
	alt?: string
): Promise<Base64Media | undefined> {
	const imagesStore = database.transaction(['images'], 'readonly').objectStore('images');
	const transaction = imagesStore.get(hash);

	return await new Promise((resolve) => {
		transaction.addEventListener('success', () => {
			const value: Base64Media | string | undefined = transaction.result ?? undefined;
			if (!value) resolve(undefined);
			else if (typeof value === 'string') {
				resolve({
					Image: {
						Base64: {
							data: value,
							alt: alt ?? ''
						}
					}
				});
			} else {
				resolve(value);
			}
		});
	});
}
export async function getAllCreationsLocal(
	database: LocalDatabase
): Promise<[IDBValidKey, InternalFuiz][]> {
	const creationsStore = database.transaction(['creations'], 'readwrite').objectStore('creations');

	const creationsTransaction = creationsStore.openCursor();

	return await new Promise((resolve) => {
		const internals: [IDBValidKey, InternalFuiz][] = [];

		creationsTransaction.addEventListener('success', () => {
			const cursor = creationsTransaction.result;
			if (cursor) {
				const value = strictifyInternalFuiz(cursor.value as LooseInternalFuiz);
				cursor.update(value);
				internals.push([cursor.key, value]);
				cursor.continue();
			} else {
				resolve(internals);
			}
		});
	});
}
export async function getCreationLocal(
	id: CreationId,
	database: LocalDatabase
): Promise<InternalFuiz | undefined> {
	const creationsStore = database.transaction(['creations'], 'readonly').objectStore('creations');
	const creationsTransaction = creationsStore.get(id);
	return await new Promise((resolve) => {
		creationsTransaction.addEventListener('success', () => {
			resolve(strictifyInternalFuiz(creationsTransaction.result) ?? undefined);
		});
	});
}

export async function deleteCreationLocal(id: CreationId, database: LocalDatabase): Promise<void> {
	const creationsStore = database.transaction(['creations'], 'readwrite').objectStore('creations');

	const request = creationsStore.delete(id);

	return await new Promise((resolve) => {
		request.addEventListener('success', () => {
			resolve(undefined);
		});
		request.addEventListener('error', () => {
			resolve(undefined);
		});
	});
}

export async function addCreationLocal(
	internalFuiz: InternalFuiz,
	database: LocalDatabase
): Promise<CreationId> {
	const creationsStore = database.transaction(['creations'], 'readwrite').objectStore('creations');

	const request = creationsStore.put(internalFuiz);

	return await new Promise((resolve) => {
		request.addEventListener('success', () => {
			resolve(parseInt(request.result.toString()));
		});
	});
}

export async function updateCreationLocal(
	id: CreationId,
	internalFuiz: InternalFuiz,
	database: LocalDatabase
): Promise<void> {
	const creationsStore = database.transaction(['creations'], 'readwrite').objectStore('creations');
	const request = creationsStore.put(internalFuiz, id);

	return await new Promise((resolve) => {
		request.addEventListener('success', () => {
			resolve(undefined);
		});
	});
}

async function hashExists(hash: string, database: LocalDatabase): Promise<boolean> {
	const imagesStore = database.transaction(['images'], 'readonly').objectStore('images');
	const request = imagesStore.count(hash);
	return await new Promise((resolve) => {
		request.addEventListener('success', () => {
			resolve(request.result > 0);
		});
	});
}

export async function updateLocalImagesDatabase(
	media: Base64Media,
	hash: string,
	database: LocalDatabase
): Promise<boolean> {
	if (!(await hashExists(hash, database))) {
		const imagesStore = database.transaction(['images'], 'readwrite').objectStore('images');
		imagesStore.add(media, hash);
		return true;
	}
	return false;
}
