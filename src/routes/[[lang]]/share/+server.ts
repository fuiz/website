import { json } from '@sveltejs/kit';
import type { IdlessFullFuizConfig } from '$lib/types';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, platform }) => {
	const config: IdlessFullFuizConfig = await request.json();

	const id = crypto.randomUUID();

	await platform?.env.MAP.put(id, JSON.stringify(config), {
		expirationTtl: 60 * 60 * 24 * 30
	});

	return json(id);
};
