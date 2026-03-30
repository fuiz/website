import { error, json } from '@sveltejs/kit';
import type { IdlessFullFuizConfig } from '$lib/types';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.shareStore) {
		error(503, 'Share functionality is not configured');
	}

	const config: IdlessFullFuizConfig = await request.json();

	const id = crypto.randomUUID();

	await locals.shareStore.put(id, JSON.stringify(config), {
		expirationTtl: 60 * 60 * 24 * 30
	});

	return json(id);
};
