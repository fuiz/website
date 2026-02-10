import { type Cookies, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { InternalFuizMetadataStrings } from '$lib/storage';

export interface OAuthTokens {
	access_token: string;
	refresh_token?: string;
	expires_in?: number;
	token_type?: string;
}

export const options = () =>
	({
		clientId: env.AUTH_GOOGLE_ID,
		clientSecret: env.AUTH_GOOGLE_SECRET,
		redirectUri: env.AUTH_GOOGLE_REDIRECT_URI
	}) as const;

export const scope = 'https://www.googleapis.com/auth/drive.appdata' as const;

export function generateAuthUrl(state: string): string {
	const { clientId, redirectUri } = options();
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope,
		access_type: 'offline',
		prompt: 'consent',
		state
	});
	return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
	const { clientId, clientSecret, redirectUri } = options();
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri
		})
	});
	if (!response.ok) throw new Error('Failed to exchange code for tokens');
	return await response.json();
}

export function getToken(cookies: Cookies): OAuthTokens {
	const credintials = cookies.get('google');
	if (!credintials) error(401, 'no google cookie');
	return JSON.parse(credintials);
}

export async function refreshToken(tokens: OAuthTokens): Promise<OAuthTokens | undefined> {
	try {
		if (!tokens.refresh_token) return undefined;
		const { clientId, clientSecret } = options();
		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: tokens.refresh_token,
				client_id: clientId,
				client_secret: clientSecret
			})
		});
		if (!response.ok) return undefined;
		const data = await response.json();
		if (!data.access_token) return undefined;
		return {
			...tokens,
			access_token: data.access_token,
			...(data.refresh_token && { refresh_token: data.refresh_token }),
			...(data.expires_in && { expires_in: data.expires_in })
		};
	} catch {
		return undefined;
	}
}

export type File = {
	id: string;
};

type ExportFileProperties = { [k: string]: string | number | ExportFileProperties };

type FileProperties = { [k: string]: string | FileProperties };

interface MediaData {
	type: string;
	data: string;
}

class Drive {
	constructor(
		private readonly tokens: OAuthTokens,
		private readonly cookies?: Cookies
	) {}

	private async apiFetch(
		path: string,
		{ upload, headers, ...init }: RequestInit & { upload?: boolean } = {}
	): Promise<Response> {
		const base = upload
			? 'https://www.googleapis.com/upload/drive/v3/files'
			: 'https://www.googleapis.com/drive/v3/files';
		const doFetch = (token: string) =>
			fetch(`${base}${path}`, {
				...init,
				headers: {
					...(headers as Record<string, string>),
					Authorization: `Bearer ${token}`
				}
			});

		const response = await doFetch(this.tokens.access_token);

		if (response.status === 401 && this.tokens.refresh_token) {
			const refreshed = await refreshToken(this.tokens);
			if (refreshed) {
				Object.assign(this.tokens, refreshed);
				if (this.cookies) {
					this.cookies.set('google', JSON.stringify(refreshed), {
						path: '/',
						httpOnly: true,
						secure: true,
						sameSite: 'lax',
						maxAge: 60 * 60 * 24 * 365
					});
				}
				return doFetch(refreshed.access_token);
			}
		}

		return response;
	}

	async deleteFile(file: File) {
		const response = await this.apiFetch(`/${encodeURIComponent(file.id)}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
		}
	}

	async file<T extends FileProperties>(
		fields: Array<keyof T>,
		search: Record<string, string>
	): Promise<(File[] & T) | undefined> {
		const q = Object.keys(search)
			.map((k) => `${k} = '${search[k]}'`)
			.join('');

		const params = new URLSearchParams({
			q,
			fields: `files(${fields.join(', ')})`,
			spaces: 'appDataFolder'
		});

		const response = await this.apiFetch(`?${params}`);

		if (!response.ok) {
			throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data.files as (File[] & T) | undefined;
	}

	async content(file: File): Promise<string | undefined> {
		try {
			const response = await this.apiFetch(`/${encodeURIComponent(file.id)}?alt=media`);

			if (!response.ok) {
				return undefined;
			}

			return await response.text();
		} catch {
			return undefined;
		}
	}

	private buildMultipartBody(
		metadata: object,
		data: MediaData
	): { body: string; boundary: string } {
		const boundary = 'fuiz_boundary_' + crypto.randomUUID();
		const body = [
			`--${boundary}`,
			'Content-Type: application/json; charset=UTF-8',
			'',
			JSON.stringify(metadata),
			`--${boundary}`,
			`Content-Type: ${data.type}`,
			'',
			data.data,
			`--${boundary}--`
		].join('\r\n');
		return { body, boundary };
	}

	async update(file: File & ExportFileProperties, data: MediaData) {
		const { id, ...metadata } = file;
		const { body, boundary } = this.buildMultipartBody(metadata, data);

		const response = await this.apiFetch(`/${encodeURIComponent(id)}?uploadType=multipart`, {
			upload: true,
			method: 'PATCH',
			headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
			body
		});

		if (!response.ok) {
			throw new Error(`Failed to update file: ${response.status} ${response.statusText}`);
		}
	}

	async create(fileProperties: ExportFileProperties, data: MediaData) {
		const metadata = { ...fileProperties, parents: ['appDataFolder'] };
		const { body, boundary } = this.buildMultipartBody(metadata, data);

		const response = await this.apiFetch('?uploadType=multipart', {
			upload: true,
			method: 'POST',
			headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
			body
		});

		if (!response.ok) {
			throw new Error(`Failed to create file: ${response.status} ${response.statusText}`);
		}
	}

	async list<T extends FileProperties, O>(
		fields: Array<keyof T>,
		search: Record<string, string>,
		transform: (file: File & T) => Promise<O>,
		pageToken?: string
	): Promise<O[]> {
		const q = Object.keys(search)
			.map((k) => `${k} = '${search[k]}'`)
			.join('');

		const params = new URLSearchParams({
			q,
			fields: `nextPageToken, files(id, ${fields.join(', ')})`,
			spaces: 'appDataFolder'
		});
		if (pageToken) params.set('pageToken', pageToken);

		const response = await this.apiFetch(`?${params}`);

		if (!response.ok) {
			throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		const files = (data.files || []) as Array<File & T>;
		const transformedFiles = await sequential(files.map(transform));

		return data.nextPageToken
			? transformedFiles.concat(await this.list(fields, search, transform, data.nextPageToken))
			: transformedFiles;
	}
}

export function getDrive(cookies: Cookies) {
	return new Drive(getToken(cookies), cookies);
}

export async function getFilesIdFromName(
	service: Drive,
	name: string
): Promise<File[] | undefined> {
	return await service.file(['id'], { name });
}

async function sequential<O>(values: Array<Promise<O>>): Promise<Array<O>> {
	const results: O[] = [];
	for (const value of values) {
		results.push(await value);
	}
	return results;
}

export async function getCreations<T>(
	service: Drive,
	f: (file: File & { name: string; properties: InternalFuizMetadataStrings }) => Promise<T>
): Promise<T[]> {
	return await service.list<
		{
			name: string;
			properties: InternalFuizMetadataStrings;
		},
		T
	>(['name', 'properties'], { mimeType: 'application/json' }, f);
}
