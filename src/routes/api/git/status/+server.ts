/**
 * Git OAuth status endpoint
 * Returns current authentication status and user information
 */

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getAuthenticatedProvider, getTokens } from '../gitUtil';
import { createGitClient } from '$lib/git/factory';

export const GET: RequestHandler = async ({ cookies }) => {
	const provider = getAuthenticatedProvider(cookies);

	if (!provider) {
		return json({
			authenticated: false,
			provider: null
		});
	}

	const tokens = getTokens(cookies, provider);

	if (!tokens) {
		return json({
			authenticated: false,
			provider: null
		});
	}

	try {
		// Try to get user information to verify token is valid
		const client = createGitClient(provider, tokens);
		const user = await client.getCurrentUser();

		return json({
			authenticated: true,
			provider,
			user: {
				id: user.id,
				username: user.username,
				name: user.name,
				avatar_url: user.avatar_url
			}
		});
	} catch (err) {
		console.error('Failed to get user info:', err);
		// Token might be invalid, return unauthenticated
		return json({
			authenticated: false,
			provider: null
		});
	}
};
