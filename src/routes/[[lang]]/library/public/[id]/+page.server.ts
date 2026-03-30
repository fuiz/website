import { error } from '@sveltejs/kit';
import { fixPublish } from '$lib/serverOnlyUtils';
import type { FullOnlineFuiz } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals, platform }) => {
	const published = await locals.database?.getById(params.id);

	if (!published) {
		error(404, 'fuiz was not found');
	}

	const fuiz = fixPublish(published);

	const onlineFuiz = await (await platform?.env?.BUCKET?.get(params.id))?.json<FullOnlineFuiz>();

	if (!onlineFuiz) {
		error(500, 'fuiz file not found');
	}

	return {
		fuiz,
		config: onlineFuiz.config
	};
}) satisfies PageServerLoad;
