import type { RequestHandler } from './$types';
import { getOAuth2Client } from '../driveUtil';
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

	const oauth2Client = getOAuth2Client();

	try {
		const { tokens } = await oauth2Client.getToken(code);

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
	} catch (err) {
		error(500, 'Failed to exchange authorization code for tokens');
	}
};
