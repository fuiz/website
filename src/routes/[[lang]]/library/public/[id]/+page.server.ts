import { error } from '@sveltejs/kit';
import { fixPublish } from '$lib/serverOnlyUtils';
import type { FullOnlineFuiz } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const published = await locals.database?.getById(params.id);

	if (!published) {
		error(404, 'fuiz was not found');
	}

	const fuiz = fixPublish(published);

	const raw = await locals.blobStorage?.get(params.id);
	const onlineFuiz = raw ? (JSON.parse(raw) as FullOnlineFuiz) : undefined;

	if (!onlineFuiz) {
		error(500, 'fuiz file not found');
	}

	return {
		fuiz,
		config: onlineFuiz.config
	};
}) satisfies PageServerLoad;
