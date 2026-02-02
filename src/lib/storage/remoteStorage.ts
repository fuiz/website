import type { RemoteSync, RemoteSyncProvider } from './interface';
import { GoogleDriveSync } from './providers/googleDrive';

export type { RemoteSync, RemoteSyncProvider };

const staticRemoteSyncProviders: RemoteSyncProvider[] = [GoogleDriveSync] as const;

export async function retrieveRemoteSync(): Promise<
	Array<{ provider: RemoteSyncProvider; authenticated: boolean }>
> {
	const results = await Promise.all(
		staticRemoteSyncProviders.map(async (provider) => {
			const status = await provider.status();
			return { provider, status };
		})
	);

	// Only return providers that are available (credentials configured)
	return results
		.filter(({ status }) => status.available)
		.map(({ provider, status }) => ({ provider, authenticated: status.authenticated }));
}
