import { fixPublish } from '$lib/serverOnlyUtils';
import { subjects as allSubjects, grades as allGrades, type PublishedFuizDB } from '$lib/types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { locales, type Locale } from '$lib/paraglide/runtime';
import { isNotNull } from '$lib/util';

function restrict<T extends string>(
	value: string | null | undefined,
	allowedValues: readonly T[]
): T | null {
	if ((value ?? null) === null) return null;
	for (const allowedValue of allowedValues) {
		if (value === allowedValue) {
			return allowedValue;
		}
	}
	return null;
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const {
		term,
		subjects,
		grades,
		languages
	}: {
		term: string;
		subjects: string[];
		grades: string[];
		languages: string[];
	} = await request.json();

	const fixedTerm = `%${term}%`;

	const languagesQueries = languages
		.map<Locale | null>((lang) => restrict(lang, locales))
		.filter(isNotNull)
		.map((lang) => `language = '${lang}'`)
		.join(' OR ');

	const subjectsQueries = subjects
		.map((subject) => restrict(subject, allSubjects))
		.filter(isNotNull)
		.map((subject) => `subjects LIKE '%"${subject}"%'`)
		.join(' OR ');

	const gradesQueries = grades
		.map((grade) => restrict(grade, allGrades))
		.filter(isNotNull)
		.map((grade) => `grades LIKE '%"${grade}"%'`)
		.join(' OR ');

	const allQueries = [languagesQueries, subjectsQueries, gradesQueries]
		.filter((query) => query.length > 0)
		.map((query) => `(${query})`)
		.join(' AND ');

	if (term.length) {
		const matches = (
			(
				await platform?.env.DATABASE.prepare(
					`SELECT * FROM fuizzes WHERE (title LIKE ? OR author LIKE ? OR subjects LIKE ? OR keywords LIKE ? OR thumbnail_alt LIKE ?) ${
						allQueries ? ' AND ' + allQueries : ''
					} LIMIT 24`
				)
					.bind(fixedTerm, fixedTerm, fixedTerm, fixedTerm, fixedTerm)
					.all<PublishedFuizDB>()
			)?.results || []
		).map(fixPublish);

		return json(matches);
	} else {
		const matches = (
			(
				await platform?.env.DATABASE.prepare(
					`SELECT * FROM fuizzes WHERE ${allQueries} LIMIT 24`
				).all<PublishedFuizDB>()
			)?.results || []
		).map(fixPublish);

		return json(matches);
	}
};
