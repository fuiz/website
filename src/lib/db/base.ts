/**
 * Base database abstract class
 * Provides a high-level interface for fuiz library database operations
 */

import type { Locale } from '$lib/paraglide/runtime';
import type { PublishedFuizDB } from '$lib/types';

type Grade = typeof import('$lib/types').grades[number];
type Subject = typeof import('$lib/types').subjects[number];

export type FuizInsertData = {
	id: string;
	storage_id: string;
	title: string;
	author: string;
	language: string;
	subjects: string | null;
	grades: string | null;
	keywords: string | null;
	slides_count: number;
	thumbnail: ArrayBuffer | Uint8Array | null;
	thumbnail_alt: string | null;
	git_commit_sha: string | null;
	played_count: number;
	view_count: number;
	published_at: string;
	updated_at: string;
};

export type FuizExistingStats = {
	id: string;
	played_count: number;
	view_count: number;
	published_at: string;
	git_commit_sha: string | null;
};

export type SearchFilters = {
	languages?: Locale[];
	subjects?: Subject[];
	grades?: Grade[];
};

export abstract class BaseDatabase {
	abstract tableExists(): Promise<boolean>;
	abstract getRecentlyPublished(limit: number): Promise<PublishedFuizDB[]>;
	abstract getById(id: string): Promise<PublishedFuizDB | null>;
	abstract search(term: string, filters: SearchFilters, limit: number): Promise<PublishedFuizDB[]>;
	abstract getExistingStats(id: string): Promise<FuizExistingStats | null>;
	abstract insertFuiz(data: FuizInsertData): Promise<void>;
	abstract deleteFuiz(id: string): Promise<void>;
}
