/**
 * Cloudflare KV implementation
 */

import type { KVNamespace } from '@cloudflare/workers-types';
import { BaseKVStore, type KVPutOptions } from './base';

export class CloudflareKVStore extends BaseKVStore {
	private kv: KVNamespace;

	constructor(kv: KVNamespace) {
		super();
		this.kv = kv;
	}

	async get<T>(key: string, format?: 'text' | 'json'): Promise<T | null> {
		if (format === 'json') {
			return this.kv.get<T>(key, 'json');
		}
		return this.kv.get(key) as Promise<T | null>;
	}

	async put(key: string, value: string, options?: KVPutOptions): Promise<void> {
		await this.kv.put(key, value, options);
	}

	async delete(key: string): Promise<void> {
		await this.kv.delete(key);
	}
}
