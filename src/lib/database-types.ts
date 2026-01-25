/**
 * Database types for Fuiz Library
 * Simple schema focused on serving published content
 */
import type { D1Database } from '@cloudflare/workers-types';

// ============================================================================
// FUIZES - Published content in the library
// ============================================================================

export interface Fuiz {
	id: string;
	storage_id: string;

	// Metadata
	title: string;
	author: string;
	language: string;
	subjects: string | null; // JSON array
	grades: string | null; // JSON array
	keywords: string | null; // JSON array
	slides_count: number;
	thumbnail: Buffer | null;
	thumbnail_alt: string | null;

	// Git reference
	git_commit_sha: string | null;
	git_pr_number: number | null;

	// Statistics
	played_count: number;
	view_count: number;

	// Timestamps
	published_at: string; // ISO timestamp
	updated_at: string; // ISO timestamp
}

export interface FuizInsert {
	id: string;
	storage_id: string;
	title: string;
	author: string;
	language: string;
	subjects?: string;
	grades?: string;
	keywords?: string;
	slides_count: number;
	thumbnail?: Buffer;
	thumbnail_alt?: string;
	git_commit_sha?: string;
	git_pr_number?: number;
}

export interface FuizUpdate {
	storage_id?: string;
	title?: string;
	author?: string;
	language?: string;
	subjects?: string;
	grades?: string;
	keywords?: string;
	slides_count?: number;
	thumbnail?: Buffer;
	thumbnail_alt?: string;
	git_commit_sha?: string;
	git_pr_number?: number;
	updated_at?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JSON array fields from database
 */
export function parseJsonArray(value: string | null): string[] {
	if (!value) return [];
	try {
		return JSON.parse(value);
	} catch {
		return [];
	}
}

/**
 * Convert array to JSON string for database
 */
export function toJsonArray(value: string[] | undefined): string | undefined {
	if (!value || value.length === 0) return undefined;
	return JSON.stringify(value);
}

/**
 * Increment play count
 */
export async function incrementPlayCount(db: D1Database, fuizId: string): Promise<void> {
	await db
		.prepare('UPDATE fuizzes SET played_count = played_count + 1 WHERE id = ?')
		.bind(fuizId)
		.run();
}

/**
 * Increment view count
 */
export async function incrementViewCount(db: D1Database, fuizId: string): Promise<void> {
	await db
		.prepare('UPDATE fuizzes SET view_count = view_count + 1 WHERE id = ?')
		.bind(fuizId)
		.run();
}
