/**
 * Filesystem blob storage implementation
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BaseBlobStorage } from './base';

export class FilesystemBlobStorage extends BaseBlobStorage {
	private dir: string;

	constructor(dir: string) {
		super();
		this.dir = dir;
	}

	private path(key: string): string {
		return join(this.dir, `${key}.json`);
	}

	async get(key: string): Promise<string | null> {
		try {
			return await readFile(this.path(key), 'utf-8');
		} catch {
			return null;
		}
	}

	async put(key: string, value: string): Promise<void> {
		await mkdir(this.dir, { recursive: true });
		await writeFile(this.path(key), value, 'utf-8');
	}

	async delete(key: string): Promise<void> {
		try {
			await rm(this.path(key));
		} catch {
			// Ignore if file doesn't exist
		}
	}
}
