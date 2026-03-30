/**
 * SQLite database implementation using bun:sqlite
 */

import { Database } from 'bun:sqlite';
import type { PublishedFuizDB } from '$lib/types';
import {
	BaseDatabase,
	type FuizExistingStats,
	type FuizInsertData,
	type SearchFilters
} from './base';
import { buildSearchQuery } from './search';

export class SQLiteDatabase extends BaseDatabase {
	private db: Database;

	constructor(path: string) {
		super();
		this.db = new Database(path);
		this.db.exec('PRAGMA journal_mode = WAL');
	}

	async tableExists(): Promise<boolean> {
		try {
			const rows = this.db.prepare('PRAGMA table_info(fuizzes)').all();
			return rows.length > 0;
		} catch {
			return false;
		}
	}

	async getRecentlyPublished(limit: number): Promise<PublishedFuizDB[]> {
		return this.db
			.prepare('SELECT * FROM fuizzes ORDER BY published_at DESC LIMIT ?')
			.all(limit) as PublishedFuizDB[];
	}

	async getById(id: string): Promise<PublishedFuizDB | null> {
		return (
			(this.db.prepare('SELECT * FROM fuizzes WHERE id = ?').get(id) as PublishedFuizDB) || null
		);
	}

	async search(term: string, filters: SearchFilters, limit: number): Promise<PublishedFuizDB[]> {
		const { sql, params } = buildSearchQuery(term, filters, limit);
		return this.db.prepare(sql).all(...params) as PublishedFuizDB[];
	}

	async getExistingStats(id: string): Promise<FuizExistingStats | null> {
		return (
			(this.db
				.prepare(
					'SELECT id, played_count, view_count, published_at, git_commit_sha FROM fuizzes WHERE id = ?'
				)
				.get(id) as FuizExistingStats) || null
		);
	}

	async insertFuiz(data: FuizInsertData): Promise<void> {
		this.db
			.prepare(
				`INSERT INTO fuizzes (
				id, storage_id, title, author, language, subjects, grades,
				keywords, slides_count, thumbnail, thumbnail_alt,
				git_commit_sha, played_count, view_count, published_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				data.id,
				data.storage_id,
				data.title,
				data.author,
				data.language,
				data.subjects,
				data.grades,
				data.keywords,
				data.slides_count,
				data.thumbnail ? Buffer.from(data.thumbnail as ArrayBuffer) : null,
				data.thumbnail_alt,
				data.git_commit_sha,
				data.played_count,
				data.view_count,
				data.published_at,
				data.updated_at
			);
	}

	async deleteFuiz(id: string): Promise<void> {
		this.db.prepare('DELETE FROM fuizzes WHERE id = ?').run(id);
	}
}
