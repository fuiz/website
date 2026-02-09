import { drive_v3 } from '@googleapis/drive';
import { type Cookies, error } from '@sveltejs/kit';
import { OAuth2Client } from 'google-auth-library';
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

export function getOAuth2Client(): OAuth2Client {
	const { clientId, clientSecret, redirectUri } = options();
	return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

export function getToken(cookies: Cookies): OAuthTokens {
	const credintials = cookies.get('google');
	if (!credintials) error(401, 'no google cookie');
	return JSON.parse(credintials);
}

export async function refreshToken(tokens: OAuthTokens): Promise<OAuthTokens | undefined> {
	try {
		const oauth2Client = getOAuth2Client();
		oauth2Client.setCredentials({
			refresh_token: tokens.refresh_token
		});

		const { credentials } = await oauth2Client.refreshAccessToken();

		if (!credentials.access_token) {
			throw new Error('Failed to refresh access token, no access token returned');
		}

		return {
			...tokens,
			access_token: credentials.access_token,
			...(credentials.refresh_token && { refresh_token: credentials.refresh_token }),
			...(credentials.expiry_date && {
				expires_in: Math.floor((credentials.expiry_date - Date.now()) / 1000)
			})
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
	private drive: drive_v3.Drive;
	private oauth2Client: OAuth2Client;

	constructor(
		private readonly tokens: OAuthTokens,
		private readonly cookies?: Cookies
	) {
		this.oauth2Client = getOAuth2Client();
		this.oauth2Client.setCredentials({
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token
		});

		this.drive = new drive_v3.Drive({ auth: this.oauth2Client });

		this.oauth2Client.on('tokens', (tokens) => {
			if (this.cookies && tokens.access_token) {
				const updatedTokens = {
					...this.tokens,
					access_token: tokens.access_token,
					...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
					...(tokens.expiry_date && {
						expires_in: Math.floor((tokens.expiry_date - Date.now()) / 1000)
					})
				};
				this.cookies.set('google', JSON.stringify(updatedTokens), {
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 365
				});
				Object.assign(this.tokens, updatedTokens);
			}
		});
	}

	async deleteFile(file: File) {
		await this.drive.files.delete({
			fileId: file.id
		});
	}

	async file<T extends FileProperties>(
		fields: Array<keyof T>,
		search: Record<string, string>
	): Promise<(File[] & T) | undefined> {
		const q = Object.keys(search)
			.map((k) => `${k} = '${search[k]}'`)
			.join('');

		const response = await this.drive.files.list({
			q,
			fields: `files(${fields.join(', ')})`,
			spaces: 'appDataFolder'
		});

		return response.data.files as (File[] & T) | undefined;
	}

	async content(file: File): Promise<string | undefined> {
		try {
			const response = await this.drive.files.get(
				{
					fileId: file.id,
					alt: 'media'
				},
				{
					responseType: 'text'
				}
			);

			return response.data as unknown as string;
		} catch {
			return undefined;
		}
	}

	async update(file: File & ExportFileProperties, data: MediaData) {
		const { id, ...metadata } = file;

		await this.drive.files.update({
			fileId: id,
			requestBody: metadata,
			media: {
				mimeType: data.type,
				body: data.data
			}
		});
	}

	async create(fileProperties: ExportFileProperties, data: MediaData) {
		await this.drive.files.create({
			requestBody: {
				...fileProperties,
				parents: ['appDataFolder']
			},
			media: {
				mimeType: data.type,
				body: data.data
			}
		});
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

		const response = await this.drive.files.list({
			q,
			pageToken,
			fields: `nextPageToken, files(id, ${fields.join(', ')})`,
			spaces: 'appDataFolder'
		});

		const files = (response.data.files || []) as Array<File & T>;
		const transformedFiles = await sequential(files.map(transform));

		return response.data.nextPageToken
			? transformedFiles.concat(
					await this.list(fields, search, transform, response.data.nextPageToken)
				)
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
