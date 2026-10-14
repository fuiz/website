import { fixPublish } from '$lib/serverOnlyUtils';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const [rawPublished, availableLanguages] = await Promise.all([
		locals.database?.getRecentlyPublished(24) ?? [],
		locals.database?.getDistinctLanguages() ?? []
	]);

	return {
		recentlyPublished: rawPublished.map(fixPublish),
		availableLanguages
	};
}) satisfies PageServerLoad;
