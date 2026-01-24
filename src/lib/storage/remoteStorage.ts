import type { RemoteSync, RemoteSyncProvider } from './interface';
import { GoogleDriveSync } from './providers/googleDrive';

export type { RemoteSync, RemoteSyncProvider };

// List all available remote storage providers (classes, not instances)
export const remoteSyncProviders: RemoteSyncProvider[] = [GoogleDriveSync];

export async function retrieveRemoteSync(): Promise<RemoteSync | undefined> {
	for (const provider of remoteSyncProviders) {
		if (await provider.isAuthenticated()) {
			return new provider();
		}
	}
	return undefined;
}
