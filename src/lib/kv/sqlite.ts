/**
 * SQLite-backed KV store implementation using better-sqlite3
 * Expired entries are filtered on read and probabilistically purged on write.
 */

import Database from 'better-sqlite3';
import { BaseKVStore, type KVPutOptions } from './base';

const CLEANUP_PROBABILITY = 0.01;
const VALID_TABLE_NAME = /^[a-z_][a-z0-9_]*$/;

export class SQLiteKVStore extends BaseKVStore {
	private db: Database.Database;
	private sql: {
		get: Database.Statement;
		put: Database.Statement;
		delete: Database.Statement;
		cleanup: Database.Statement;
	};

	constructor(path: string, namespace: string) {
		super();

		if (!VALID_TABLE_NAME.test(namespace)) {
			throw new Error(`Invalid KV namespace: ${namespace}`);
		}

		this.db = new Database(path);
		this.db.pragma('journal_mode = WAL');
		this.db.exec(
			`CREATE TABLE IF NOT EXISTS ${namespace} (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER)`
		);
		this.db.exec(
			`CREATE INDEX IF NOT EXISTS idx_${namespace}_expires_at ON ${namespace} (expires_at)`
		);

		this.sql = {
			get: this.db.prepare(
				`SELECT value FROM ${namespace} WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)`
			),
			put: this.db.prepare(
				`INSERT INTO ${namespace} (key, value, expires_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at`
			),
			delete: this.db.prepare(`DELETE FROM ${namespace} WHERE key = ?`),
			cleanup: this.db.prepare(
				`DELETE FROM ${namespace} WHERE expires_at IS NOT NULL AND expires_at <= ?`
			)
		};
	}

	async get<T>(key: string, format?: 'text' | 'json'): Promise<T | null> {
		const now = Math.floor(Date.now() / 1000);
		const row = this.sql.get.get(key, now) as { value: string } | undefined;

		if (!row) return null;

		if (format === 'json') {
			return JSON.parse(row.value) as T;
		}
		return row.value as T;
	}

	async put(key: string, value: string, options?: KVPutOptions): Promise<void> {
		const expiresAt = options?.expirationTtl
			? Math.floor(Date.now() / 1000) + options.expirationTtl
			: null;

		this.sql.put.run(key, value, expiresAt);

		if (Math.random() < CLEANUP_PROBABILITY) {
			this.sql.cleanup.run(Math.floor(Date.now() / 1000));
		}
	}

	async delete(key: string): Promise<void> {
		this.sql.delete.run(key);
	}
}
