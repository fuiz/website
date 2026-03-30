import { fixPublish } from '$lib/serverOnlyUtils';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const recentlyPublished = ((await locals.database?.getRecentlyPublished(24)) || []).map(
		fixPublish
	);

	return {
		recentlyPublished
	};
}) satisfies PageServerLoad;
