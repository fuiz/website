/**
 * Initialize publish job
 * Creates a job ID and stores FullOnlineFuiz for streaming endpoint
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { FullOnlineFuiz } from '$lib/types';
import { getAuthenticatedProvider, getTokens } from '../../git/gitUtil';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	// Check Git authentication
	const provider = getAuthenticatedProvider(cookies);
	if (!provider) {
		return json({ error: 'git_auth_required' }, { status: 401 });
	}

	const tokens = getTokens(cookies, provider);
	if (!tokens) {
		return json({ error: 'git_auth_required' }, { status: 401 });
	}

	try {
		const { fuiz }: { fuiz: FullOnlineFuiz } = await request.json();

		if (!fuiz || !fuiz.config || !fuiz.author || !fuiz.language) {
			return json({ error: 'missing_or_invalid_fuiz' }, { status: 400 });
		}

		// Generate job ID
		const jobId = crypto.randomUUID();

		// Store job data in KV with 10 minute expiration
		await platform?.env.PUBLISH_JOBS.put(jobId, JSON.stringify(fuiz), { expirationTtl: 600 });

		return json({ jobId });
	} catch (err) {
		console.error('Failed to initialize publish:', err);
		return json({ error: 'init_failed', message: String(err) }, { status: 500 });
	}
};
