import { type Actions, redirect } from '@sveltejs/kit';
import { createGitClient } from '$lib/git/factory';
import { getAuthenticatedProvider, getTokens } from '../../api/git/gitUtil';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load = (async ({ cookies }) => {
	// Check if user is authenticated with any Git provider
	const provider = getAuthenticatedProvider(cookies);
	console.log('[publish load] Provider:', provider);

	if (!provider) {
		console.log('[publish load] No provider found, redirecting to login');
		// Not authenticated, redirect to Git login
		redirect(303, '/api/git/login?return=/publish');
	}

	const tokens = getTokens(cookies, provider);
	console.log('[publish load] Tokens:', tokens ? 'present' : 'missing');
	if (!tokens) {
		console.log('[publish load] No tokens found, redirecting to login');
		redirect(303, '/api/git/login?return=/publish');
	}

	// Verify authentication by getting user info
	try {
		const client = createGitClient(provider, tokens);
		const user = await client.getCurrentUser();
		console.log('[publish load] User authenticated:', user.username);
		return {};
	} catch (error) {
		// Token invalid, redirect to login
		console.error('[publish load] Token verification failed:', error);
		redirect(303, '/api/git/login?return=/publish');
	}
}) satisfies PageServerLoad;

export const actions: Actions = {};
