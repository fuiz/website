import { fixPublish } from '$lib/serverOnlyUtils';
import type { PublishedFuizDB } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ platform }) => {
	const recentlyPublished = (
		((
			await platform?.env.DATABASE.prepare(
				'SELECT * FROM fuizzes ORDER BY published_at DESC LIMIT 24'
			).all()
		)?.results || []) as PublishedFuizDB[]
	).map(fixPublish);

	return {
		recentlyPublished
	};
}) satisfies PageServerLoad;
