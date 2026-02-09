/**
 * Git OAuth callback endpoint
 * Handles OAuth callback from Git provider and exchanges code for tokens
 */

import { error } from '@sveltejs/kit';
import type { GitProvider } from '$lib/git/types';
import { exchangeCodeForTokens, storeTokens } from '../gitUtil';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');

	// Handle OAuth errors
	if (errorParam) {
		const errorDescription = url.searchParams.get('error_description') || errorParam;
		error(400, `OAuth error: ${errorDescription}`);
	}

	if (!code) {
		error(400, 'Missing authorization code');
	}

	// Validate state parameter for CSRF protection
	const storedState = cookies.get('git_oauth_state');
	const provider = cookies.get('git_oauth_provider') as GitProvider;
	const returnUrl = cookies.get('git_oauth_return') || '/';

	if (!state) {
		error(403, 'Missing state parameter');
	}

	if (!storedState) {
		error(403, 'Missing stored state - session may have expired');
	}

	if (state !== storedState) {
		error(403, 'State mismatch - possible CSRF attack');
	}

	if (!provider) {
		error(400, 'Missing provider information');
	}

	// Clear the one-time use cookies
	cookies.delete('git_oauth_state', { path: '/' });
	cookies.delete('git_oauth_provider', { path: '/' });
	cookies.delete('git_oauth_return', { path: '/' });

	try {
		// Exchange code for tokens
		const tokens = await exchangeCodeForTokens(provider, code);
		console.log('Token exchange successful for provider:', provider);

		// Store tokens in secure httpOnly cookie
		storeTokens(cookies, provider, tokens);
		console.log('Tokens stored in cookie, redirecting to:', returnUrl);

		return new Response(null, {
			status: 302,
			headers: {
				Location: returnUrl
			}
		});
	} catch (err) {
		console.error('Token exchange error:', err);
		error(500, 'Failed to exchange authorization code for tokens');
	}
};
