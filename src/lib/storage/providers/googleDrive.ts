import type {
	InternalFuiz,
	CreationId,
	StrictInternalFuizMetadata,
	LocalDatabase,
	MediaReferencedFuizConfig
} from '..';
import type { Media } from '../../types';
import { bring } from '../../util';
import { reconcile } from '../utils';

export class GoogleDriveSync {
	// Static metadata
	static readonly name = 'google-drive';
	static readonly displayName = 'Google Drive';

	// Static method - check authentication status
	static async isAuthenticated(): Promise<boolean> {
		try {
			const response = await fetch('/api/gdrive/status');
			if (!response.ok) return false;
			const status = await response.json();
			return status.authenticated;
		} catch {
			return false;
		}
	}

	// Static method - initiate login
	static login(returnUrl?: string): void {
		const url = returnUrl ?? window.location.pathname;
		window.location.href = `/api/gdrive/login?return=${encodeURIComponent(url)}`;
	}

	// Instance method - logout
	logout(): void {
		window.location.href = '/api/gdrive/logout';
	}

	async sync(
		localDatabase: LocalDatabase,
		existing: [CreationId, StrictInternalFuizMetadata][]
	): Promise<void> {
		const res = await bring(`/api/gdrive/fuiz`);
		if (!res?.ok) return;

		await reconcile(
			this,
			localDatabase,
			await res.json(),
			async (hash) => {
				const reqExists = await bring(`/api/gdrive/images/${hash}`, { method: 'HEAD' });
				return reqExists?.ok ?? false;
			},
			existing
		);
	}

	async get(uuid: string): Promise<MediaReferencedFuizConfig | undefined> {
		const res = await bring(`/api/gdrive/fuiz/${uuid}`);

		return res?.ok ? await res.json() : undefined;
	}

	async create(uuid: string, internalFuiz: InternalFuiz): Promise<void> {
		await fetch(`/api/gdrive/fuiz/${uuid}`, {
			method: 'POST',
			body: JSON.stringify(internalFuiz)
		});
	}

	async update(uuid: string, internalFuiz: InternalFuiz): Promise<void> {
		await fetch(`/api/gdrive/fuiz/${uuid}`, {
			method: 'PUT',
			body: JSON.stringify(internalFuiz)
		});
	}

	async delete(uuid: string): Promise<void> {
		await fetch(`/api/gdrive/fuiz/${uuid}`, {
			method: 'DELETE'
		});
	}

	async createImage(hash: string, value: string | Media): Promise<void> {
		const reqExists = await bring(`/api/gdrive/images/${hash}`, { method: 'HEAD' });
		if (reqExists?.ok) return undefined;
		const serialized = typeof value === 'string' ? value : JSON.stringify(value);
		await fetch(`/api/gdrive/images`, {
			method: 'POST',
			body: serialized
		});
	}

	async getImage(hash: string): Promise<string | undefined> {
		const res = await bring(`/api/gdrive/images/${hash}`);
		if (!res?.ok) return undefined;
		const media = await res.text();
		try {
			return JSON.parse(media);
		} catch {
			return media;
		}
	}
}
