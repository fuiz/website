import type { Base64Media } from '../types';
import type { CreationId, InternalFuiz, InternalFuizMetadata, MediaReferencedFuizConfig } from '.';

export interface RemoteSyncProviderStatus {
	authenticated: boolean;
	available: boolean;
}

export interface RemoteSyncProvider {
	// Static metadata
	readonly name: string;
	readonly displayName: string;

	// Static authentication methods
	status(): Promise<RemoteSyncProviderStatus>;
	login(returnUrl?: string): void;

	// Constructor creates instances with these instance methods
	new (): {
		readonly name: string;
		readonly displayName: string;

		// Instance methods
		logout(): void;
		sync(
			localDatabase: IDBDatabase,
			creations: [CreationId, InternalFuizMetadata][]
		): Promise<void>;
		create(uuid: string, internalFuiz: InternalFuiz): Promise<void>;
		get(uuid: string): Promise<MediaReferencedFuizConfig | undefined>;
		update(uuid: string, internalFuiz: InternalFuiz): Promise<void>;
		delete(uuid: string): Promise<void>;
		createImage(hash: string, value: Base64Media): Promise<void>;
		getImage(hash: string): Promise<Base64Media | undefined>;
	};
}

export type RemoteSync = InstanceType<RemoteSyncProvider>;
