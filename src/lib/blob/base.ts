/**
 * Base blob storage abstract class
 * Provides a simple interface for storing and retrieving JSON blobs by key
 */

export abstract class BaseBlobStorage {
	abstract get(key: string): Promise<string | null>;
	abstract put(key: string, value: string): Promise<void>;
	abstract delete(key: string): Promise<void>;
}
