import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fixPublish } from '$lib/serverOnlyUtils';
import type { FullOnlineFuiz, PublishedFuizDB } from '$lib/types';

export const load = (async ({ params, platform }) => {
	const published: PublishedFuizDB | undefined =
		(await platform?.env.DATABASE.prepare(
			'SELECT * FROM approved_submissions WHERE storage_id = ?1'
		)
			.bind(params.id)
			.first()) || undefined;

	if (!published) {
		error(404, 'fuiz was not found');
	}

	const fuiz = fixPublish(published);

	const onlineFuiz = await (await platform?.env.BUCKET.get(params.id))?.json<FullOnlineFuiz>();

	if (!onlineFuiz) {
		error(500, 'fuiz file not found');
	}

	return {
		fuiz,
		config: onlineFuiz.config
	};
}) satisfies PageServerLoad;
