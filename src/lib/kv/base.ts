/**
 * Base KV store abstract class
 * Provides a simple interface for key-value storage with optional TTL
 */

export type KVPutOptions = {
	expirationTtl?: number;
};

export abstract class BaseKVStore {
	abstract get<T = string>(key: string, format?: 'text'): Promise<T | null>;
	abstract get<T>(key: string, format: 'json'): Promise<T | null>;
	abstract put(key: string, value: string, options?: KVPutOptions): Promise<void>;
	abstract delete(key: string): Promise<void>;
}
