import type {
	InternalFuiz,
	CreationId,
	StrictInternalFuizMetadata,
	MediaReferencedFuizConfig
} from '.';
import type { Media } from '../types';

export interface RemoteSyncProvider {
	// Static metadata
	readonly name: string;
	readonly displayName: string;

	// Static authentication methods
	isAuthenticated(): Promise<boolean>;
	login(returnUrl?: string): void;

	// Constructor creates instances with these instance methods
	new (): {
		logout(): void;
		sync(
			localDatabase: IDBDatabase,
			creations: [CreationId, StrictInternalFuizMetadata][]
		): Promise<void>;
		create(uuid: string, internalFuiz: InternalFuiz): Promise<void>;
		get(uuid: string): Promise<MediaReferencedFuizConfig | undefined>;
		update(uuid: string, internalFuiz: InternalFuiz): Promise<void>;
		delete(uuid: string): Promise<void>;
		createImage(hash: string, value: string | Media): Promise<void>;
		getImage(hash: string): Promise<Media | string | undefined>;
	};
}

export type RemoteSync = InstanceType<RemoteSyncProvider>;
