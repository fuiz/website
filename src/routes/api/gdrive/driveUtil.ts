import { env } from '$env/dynamic/private';
import type { StrictInternalFuizMetadataStrings } from '$lib/storage';
import { bring } from '$lib/util';
import { error, type Cookies } from '@sveltejs/kit';
import type { OAuthTokens } from 'worker-auth-providers';

export const options = () =>
	({
		clientId: env.CLIENT_ID,
		clientSecret: env.CLIENT_SECRET,
		redirectUri: env.REDIRECT_URI
	} as const);

export const scope = 'https://www.googleapis.com/auth/drive.appdata' as const;

export function getToken(cookies: Cookies): OAuthTokens {
	const credintials = cookies.get('google');
	if (!credintials) error(401, 'no google cookie');
	return JSON.parse(credintials);
}

export async function refreshToken(tokens: OAuthTokens): Promise<OAuthTokens | undefined> {
	const { clientId, clientSecret } = options();
	const response = await bring('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json'
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: tokens.refresh_token,
			grant_type: 'refresh_token'
		})
	});

	if (!response?.ok) return undefined;

	const newTokens = await response.json();

	return {
		...tokens,
		...newTokens
	};
}

export type File = {
	id: string;
};

type ExportFileProperties = { [k: string]: string | number | ExportFileProperties };

type FileProperties = { [k: string]: string | FileProperties };

interface Metadata {
	[key: string]: string | string[] | Metadata;
}

interface MediaData {
	type: string;
	data: string;
}

function createMultipartBody(metadata: Metadata, mediaData: MediaData, boundary: string): string {
	const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
		metadata
	)}\r\n`;
	const mediaPart = `--${boundary}\r\nContent-Type: ${mediaData.type}\r\n\r\n${mediaData.data}\r\n`;
	const closingBoundary = `--${boundary}--\r\n`;

	return metadataPart + mediaPart + closingBoundary;
}

function generateBoundary() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const boundaryLength = 16;
	return Array.from({ length: boundaryLength }, () =>
		characters.charAt(Math.floor(Math.random() * characters.length))
	).join('');
}

class Drive {
	constructor(
		private readonly tokens: OAuthTokens,
		private readonly cookies?: Cookies
	) {}

	private headers(): HeadersInit {
		return {
			Authorization: 'Bearer ' + this.tokens.access_token,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};
	}

	private async refreshTokenIfNeeded(response: Response): Promise<boolean> {
		if (response.status === 401 && this.cookies) {
			const newTokens = await refreshToken(this.tokens);
			if (newTokens) {
				this.cookies.set('google', JSON.stringify(newTokens), {
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 365
				});
				Object.assign(this.tokens, newTokens);
				return true;
			}
		}
		return false;
	}

	private async fetchWithRetry(url: URL | string, init?: RequestInit): Promise<Response> {
		const response = await fetch(url, init);
		if (await this.refreshTokenIfNeeded(response)) {
			return await fetch(url, { ...init, headers: this.headers() });
		}
		return response;
	}

	async deleteFile(file: File) {
		await this.fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
			method: 'DELETE',
			headers: this.headers()
		});
	}

	async file<T extends FileProperties>(
		fields: Array<keyof T>,
		search: Record<string, string>
	): Promise<(File & T) | undefined> {
		const url = new URL('https://www.googleapis.com/drive/v3/files');
		url.search = new URLSearchParams({
			q: Object.keys(search)
				.map((k) => `${k} = '${search[k]}'`)
				.join(''),
			fields: `files(${fields.join(', ')})`,
			spaces: 'appDataFolder'
		}).toString();
		const res = await this.fetchWithRetry(url, {
			headers: this.headers()
		});
		const { files }: { files: Array<File & T> } = await res.json();
		return files.at(0);
	}

	async content(file: File): Promise<string | undefined> {
		const url = new URL(`https://www.googleapis.com/drive/v3/files/${file.id}`);
		url.search = new URLSearchParams({
			spaces: 'appDataFolder',
			alt: 'media'
		}).toString();

		const res = await this.fetchWithRetry(url, {
			headers: {
				...this.headers(),
				Accept: 'text/plain'
			}
		});

		if (!res.ok) return undefined;
		return await res.text();
	}

	async update(file: File & ExportFileProperties, data: MediaData) {
		const url = new URL('https://www.googleapis.com/upload/drive/v3/files');
		url.search = new URLSearchParams({
			fieldId: file.id,
			spaces: 'appDataFolder',
			uploadType: 'multipart'
		}).toString();

		const { id, ...metadata } = file;

		const boundary = generateBoundary();

		const requestBody = createMultipartBody(
			{
				fileId: id,
				...metadata
			},
			data,
			boundary
		);

		await this.fetchWithRetry(url, {
			method: 'PATCH',
			headers: {
				...this.headers(),
				'Content-Type': `multipart/related; boundary=${boundary}`,
				'Content-Length': requestBody.length.toString()
			},
			body: requestBody
		});
	}

	async create(fileProperties: ExportFileProperties, data: MediaData) {
		const url = new URL('https://www.googleapis.com/upload/drive/v3/files');
		url.search = new URLSearchParams({
			uploadType: 'multipart'
		}).toString();

		const boundary = generateBoundary();

		const requestBody = createMultipartBody(
			{ ...fileProperties, parents: ['appDataFolder'] },
			data,
			boundary
		);

		await this.fetchWithRetry(url, {
			method: 'POST',
			headers: {
				...this.headers(),
				'Content-Type': `multipart/related; boundary=${boundary}`,
				'Content-Length': requestBody.length.toString()
			},
			body: requestBody
		});
	}

	async list<T extends FileProperties, O>(
		fields: Array<keyof T>,
		search: Record<string, string>,
		transform: (file: File & T) => Awaited<O>,
		pageToken?: string
	): Promise<O[]> {
		const url = new URL('https://www.googleapis.com/drive/v3/files');
		url.search = new URLSearchParams({
			...(pageToken && { pageToken }),
			q: Object.keys(search)
				.map((k) => `${k} = '${search[k]}'`)
				.join(''),
			fields: `nextPageToken, files(id, ${fields.join(', ')})`,
			spaces: 'appDataFolder'
		}).toString();

		const res = await this.fetchWithRetry(url, {
			headers: this.headers()
		});

		const { files, nextPageToken }: { files: Array<File & T>; nextPageToken: string | undefined } =
			await res.json();

		const transformedFiles = await sequential(files.map(transform));

		return nextPageToken
			? transformedFiles.concat(await this.list(fields, search, transform, nextPageToken))
			: transformedFiles;
	}
}

export function getDrive(cookies: Cookies) {
	return new Drive(getToken(cookies), cookies);
}

export async function getFileIdFromName(service: Drive, name: string): Promise<File | undefined> {
	return await service.file(['id'], { name });
}

async function sequential<O>(values: Array<Awaited<O>>): Promise<Array<O>> {
	const results: O[] = [];
	for (const value of values) {
		results.push(await value);
	}
	return results;
}

export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function attempt(f: () => Awaited<void>) {
	try {
		await f();
	} catch {
		return undefined;
	}
}

export async function getCreations<T>(
	service: Drive,
	f: (file: File & { name: string; properties: StrictInternalFuizMetadataStrings }) => Awaited<T>
): Promise<T[]> {
	return await service.list<
		{
			name: string;
			properties: StrictInternalFuizMetadataStrings;
		},
		T
	>(['name', 'properties'], { mimeType: 'application/json' }, f);
}

export async function getImages<T>(
	service: Drive,
	f: (file: File & { name: string }) => Awaited<T>
): Promise<T[]> {
	return await service.list<{ name: string }, T>(['name'], { mimeType: 'text/plain' }, f);
}
