/**
 * Cloudflare R2 blob storage implementation
 */

import type { R2Bucket } from '@cloudflare/workers-types';
import { BaseBlobStorage } from './base';

export class R2BlobStorage extends BaseBlobStorage {
	private bucket: R2Bucket;

	constructor(bucket: R2Bucket) {
		super();
		this.bucket = bucket;
	}

	async get(key: string): Promise<string | null> {
		const object = await this.bucket.get(key);
		if (!object) return null;
		return await object.text();
	}

	async put(key: string, value: string): Promise<void> {
		await this.bucket.put(key, value);
	}

	async delete(key: string): Promise<void> {
		await this.bucket.delete(key);
	}
}
