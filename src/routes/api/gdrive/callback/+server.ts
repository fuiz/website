import { error } from '@sveltejs/kit';
import { getOAuth2Client } from '../driveUtil';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		error(400, `OAuth error: ${errorParam}`);
	}

	if (!code) {
		error(400, 'Missing authorization code');
	}

	// Validate state parameter for CSRF protection
	const storedState = cookies.get('oauth_state');

	if (!state) {
		error(403, 'Missing state parameter');
	}

	if (!storedState) {
		error(403, 'Missing stored state - session may have expired');
	}

	if (state !== storedState) {
		error(403, 'State mismatch - possible CSRF attack');
	}

	// Get the return URL from cookie
	const returnUrl = cookies.get('oauth_return') || '/';

	// Clear the one-time use cookies
	cookies.delete('oauth_state', { path: '/' });
	cookies.delete('oauth_return', { path: '/' });

	const oauth2Client = getOAuth2Client();

	try {
		const { tokens } = await oauth2Client.getToken(code);

		cookies.set('google', JSON.stringify(tokens), {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 365
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: returnUrl
			}
		});
	} catch {
		error(500, 'Failed to exchange authorization code for tokens');
	}
};
