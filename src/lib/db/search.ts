/**
 * Shared search query builder for SQLite-compatible databases (D1 and SQLite)
 */

import type { SearchFilters } from './base';

export function buildSearchQuery(
	term: string,
	filters: SearchFilters,
	limit: number
): { sql: string; params: string[] } {
	const languagesQueries = (filters.languages || [])
		.map((lang) => `language = '${lang}'`)
		.join(' OR ');

	const subjectsQueries = (filters.subjects || [])
		.map((subject) => `subjects LIKE '%"${subject}"%'`)
		.join(' OR ');

	const gradesQueries = (filters.grades || [])
		.map((grade) => `grades LIKE '%"${grade}"%'`)
		.join(' OR ');

	const allQueries = [languagesQueries, subjectsQueries, gradesQueries]
		.filter((query) => query.length > 0)
		.map((query) => `(${query})`)
		.join(' AND ');

	if (term.length) {
		const fixedTerm = `%${term}%`;
		const sql = `SELECT * FROM fuizzes WHERE (title LIKE ? OR author LIKE ? OR subjects LIKE ? OR keywords LIKE ? OR thumbnail_alt LIKE ?) ${
			allQueries ? ' AND ' + allQueries : ''
		} LIMIT ${limit}`;
		return { sql, params: [fixedTerm, fixedTerm, fixedTerm, fixedTerm, fixedTerm] };
	} else {
		const sql = `SELECT * FROM fuizzes WHERE ${allQueries} LIMIT ${limit}`;
		return { sql, params: [] };
	}
}
