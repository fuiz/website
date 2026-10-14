import { error } from '@sveltejs/kit';
import type { IdlessFullFuizConfig } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	if (!locals.shareStore) {
		error(503, 'Share functionality is not configured');
	}

	const id = params.id;

	const fuiz = await locals.shareStore.get<IdlessFullFuizConfig>(id, 'json');

	if (!fuiz) {
		error(404, 'fuiz not found');
	}

	return {
		fuiz
	};
}) satisfies PageServerLoad;
