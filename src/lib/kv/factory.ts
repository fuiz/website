/**
 * KV store factory
 * Creates appropriate KV store instance based on KV_PROVIDER environment variable
 */

import type { KVNamespace } from '@cloudflare/workers-types';
import { env } from '$env/dynamic/private';
import type { BaseKVStore } from './base';

export type KVProvider = 'cloudflare' | 'sqlite';

/**
 * Create a KV store instance based on environment configuration
 *
 * Environment variables:
 *   KV_PROVIDER: 'cloudflare' | 'sqlite' (defaults to 'cloudflare' if KV binding exists, otherwise 'sqlite')
 *   KV_DATABASE_URL: file path for sqlite KV (e.g. './data/kv.db')
 *
 * @param kvBinding - Cloudflare KV namespace binding (optional)
 * @param namespace - Table name for sqlite backend (required for sqlite to avoid key collisions)
 */
export async function createKVStore(
	kvBinding?: KVNamespace,
	namespace?: string
): Promise<BaseKVStore | undefined> {
	const provider = (env.KV_PROVIDER as KVProvider) || (kvBinding ? 'cloudflare' : 'sqlite');

	switch (provider) {
		case 'cloudflare': {
			if (!kvBinding) {
				console.error('KV_PROVIDER is cloudflare but no KV binding found');
				return undefined;
			}
			const { CloudflareKVStore } = await import('./cloudflare');
			return new CloudflareKVStore(kvBinding);
		}
		case 'sqlite': {
			const dbPath = env.KV_DATABASE_URL;
			if (!dbPath) {
				console.error('KV_PROVIDER is sqlite but KV_DATABASE_URL is not set');
				return undefined;
			}
			if (!namespace) {
				console.error('KV_PROVIDER is sqlite but no namespace provided');
				return undefined;
			}
			const { SQLiteKVStore } = await import('./sqlite');
			return new SQLiteKVStore(dbPath, namespace);
		}
		default:
			console.error(`Unknown KV_PROVIDER: ${provider}`);
			return undefined;
	}
}
