import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { IdlessFullFuizConfig } from '$lib/types';

export const load = (async ({ params, platform }) => {
	const id = params.id;

	const fuiz = await platform?.env.MAP.get<IdlessFullFuizConfig>(id, 'json');

	if (!fuiz) {
		error(404, 'fuiz not found');
	}

	return {
		fuiz
	};
}) satisfies PageServerLoad;
