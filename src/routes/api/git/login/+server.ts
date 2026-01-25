/**
 * Git OAuth login endpoint
 * Initiates OAuth flow with selected Git provider
 */

import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { generateState, getAuthUrl } from '../gitUtil';
import type { GitProvider } from '$lib/git/types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	// Get provider from query params (default to gitlab)
	const providerParam = url.searchParams.get('provider') || 'gitlab';
	const provider = providerParam as GitProvider;

	if (!['gitlab', 'github'].includes(provider)) {
		error(400, 'Invalid provider. Must be "gitlab" or "github"');
	}

	// Get the return URL from query params
	const returnUrl = url.searchParams.get('return') || '/';

	// Generate cryptographically secure random state for CSRF protection
	const state = generateState();

	// Store state, provider, and return URL in secure cookies for validation on callback
	cookies.set('git_oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	cookies.set('git_oauth_provider', provider, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	cookies.set('git_oauth_return', returnUrl, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Build OAuth authorization URL
	const authUrl = getAuthUrl(provider, state);

	return new Response(null, {
		status: 302,
		headers: {
			Location: authUrl
		}
	});
};
