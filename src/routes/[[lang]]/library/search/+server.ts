import { json } from '@sveltejs/kit';
import type { Locale } from '$lib/paraglide/runtime';
import { locales } from '$lib/paraglide/runtime';
import { fixPublish } from '$lib/serverOnlyUtils';
import { grades as allGrades, subjects as allSubjects } from '$lib/types';
import { isNotNull } from '$lib/util';
import type { RequestHandler } from './$types';

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

export const POST: RequestHandler = async ({ request, locals }) => {
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

	const matches = (
		(await locals.database?.search(
			term,
			{
				languages: languages
					.map<Locale | null>((lang) => restrict(lang, locales))
					.filter(isNotNull),
				subjects: subjects.map((s) => restrict(s, allSubjects)).filter(isNotNull),
				grades: grades.map((g) => restrict(g, allGrades)).filter(isNotNull)
			},
			24
		)) || []
	).map(fixPublish);

	return json(matches);
};
