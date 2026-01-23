import type { RequestHandler } from './$types';
import { options } from '../driveUtil';
import { bring } from '$lib/util';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		error(400, `OAuth error: ${errorParam}`);
	}

	if (!code) {
		error(400, 'Missing authorization code');
	}

	const { clientId, clientSecret, redirectUri } = options();

	if (!clientId || !clientSecret || !redirectUri) {
		error(500, 'Google Drive OAuth not configured');
	}

	const tokenResponse = await bring('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		})
	});

	if (!tokenResponse?.ok) {
		error(500, 'Failed to exchange authorization code for tokens');
	}

	const tokens = await tokenResponse.json();

	cookies.set('google', JSON.stringify(tokens), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365
	});

	// Redirect back to where the user came from, or home if not set
	const returnUrl = url.searchParams.get('state') || '/';

	return new Response(null, {
		status: 302,
		headers: {
			Location: returnUrl
		}
	});
};
