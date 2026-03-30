/**
 * Blob storage factory
 * Creates appropriate blob storage instance based on STORAGE_PROVIDER environment variable
 */

import type { R2Bucket } from '@cloudflare/workers-types';
import { env } from '$env/dynamic/private';
import type { BaseBlobStorage } from './base';

export type StorageProvider = 'r2' | 'filesystem';

/**
 * Create a blob storage instance based on environment configuration
 *
 * Environment variables:
 *   STORAGE_PROVIDER: 'r2' | 'filesystem' (defaults to 'r2' if R2 binding exists, otherwise 'filesystem')
 *   STORAGE_PATH: directory path for filesystem storage (e.g. './data/storage')
 */
export async function createBlobStorage(
	r2Binding?: R2Bucket
): Promise<BaseBlobStorage | undefined> {
	const provider = (env.STORAGE_PROVIDER as StorageProvider) || (r2Binding ? 'r2' : 'filesystem');

	switch (provider) {
		case 'r2': {
			if (!r2Binding) {
				console.error('STORAGE_PROVIDER is r2 but no R2 binding found');
				return undefined;
			}
			const { R2BlobStorage } = await import('./r2');
			return new R2BlobStorage(r2Binding);
		}
		case 'filesystem': {
			const storagePath = env.STORAGE_PATH;
			if (!storagePath) {
				console.error('STORAGE_PROVIDER is filesystem but STORAGE_PATH is not set');
				return undefined;
			}
			const { FilesystemBlobStorage } = await import('./filesystem');
			return new FilesystemBlobStorage(storagePath);
		}
		default:
			console.error(`Unknown STORAGE_PROVIDER: ${provider}`);
			return undefined;
	}
}
