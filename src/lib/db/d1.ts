/**
 * Cloudflare D1 database implementation
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { PublishedFuizDB } from '$lib/types';
import {
	BaseDatabase,
	type FuizExistingStats,
	type FuizInsertData,
	type SearchFilters
} from './base';
import { buildSearchQuery } from './search';

export class D1DatabaseAdapter extends BaseDatabase {
	private db: D1Database;

	constructor(db: D1Database) {
		super();
		this.db = db;
	}

	async tableExists(): Promise<boolean> {
		try {
			const tableInfo = await this.db.prepare('PRAGMA table_info(fuizzes)').all();
			return tableInfo.results.length > 0;
		} catch {
			return false;
		}
	}

	async getRecentlyPublished(limit: number): Promise<PublishedFuizDB[]> {
		const result = await this.db
			.prepare('SELECT * FROM fuizzes ORDER BY published_at DESC LIMIT ?')
			.bind(limit)
			.all<PublishedFuizDB>();
		return result.results;
	}

	async getById(id: string): Promise<PublishedFuizDB | null> {
		return (
			(await this.db
				.prepare('SELECT * FROM fuizzes WHERE id = ?')
				.bind(id)
				.first<PublishedFuizDB>()) || null
		);
	}

	async search(term: string, filters: SearchFilters, limit: number): Promise<PublishedFuizDB[]> {
		const { sql, params } = buildSearchQuery(term, filters, limit);
		const result = await this.db
			.prepare(sql)
			.bind(...params)
			.all<PublishedFuizDB>();
		return result.results;
	}

	async getExistingStats(id: string): Promise<FuizExistingStats | null> {
		return (
			(await this.db
				.prepare(
					'SELECT id, played_count, view_count, published_at, git_commit_sha FROM fuizzes WHERE id = ?'
				)
				.bind(id)
				.first<FuizExistingStats>()) || null
		);
	}

	async insertFuiz(data: FuizInsertData): Promise<void> {
		await this.db
			.prepare(
				`INSERT INTO fuizzes (
				id, storage_id, title, author, language, subjects, grades,
				keywords, slides_count, thumbnail, thumbnail_alt,
				git_commit_sha, played_count, view_count, published_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				data.id,
				data.storage_id,
				data.title,
				data.author,
				data.language,
				data.subjects,
				data.grades,
				data.keywords,
				data.slides_count,
				data.thumbnail,
				data.thumbnail_alt,
				data.git_commit_sha,
				data.played_count,
				data.view_count,
				data.published_at,
				data.updated_at
			)
			.run();
	}

	async deleteFuiz(id: string): Promise<void> {
		await this.db.prepare('DELETE FROM fuizzes WHERE id = ?').bind(id).run();
	}
}
