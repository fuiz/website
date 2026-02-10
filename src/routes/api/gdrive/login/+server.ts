import { error } from '@sveltejs/kit';
import { generateAuthUrl, options } from '../driveUtil';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const { clientId, redirectUri } = options();

	if (!clientId || !redirectUri) {
		error(500, 'Google Drive OAuth not configured');
	}

	// Generate cryptographically secure random state for CSRF protection
	const randomBytes = new Uint8Array(32);
	crypto.getRandomValues(randomBytes);
	const state = randomBytes.toBase64();

	// Get the return URL from query params
	const returnUrl = url.searchParams.get('return') || '/';

	// Store state and return URL in secure cookies for validation on callback
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	cookies.set('oauth_return', returnUrl, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: generateAuthUrl(state)
		}
	});
};
