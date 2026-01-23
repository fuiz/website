import type { RequestHandler } from './$types';
import { getOAuth2Client, scope, options } from '../driveUtil';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const { clientId, redirectUri } = options();

	if (!clientId || !redirectUri) {
		error(500, 'Google Drive OAuth not configured');
	}

	const oauth2Client = getOAuth2Client();

	// Get the return URL from query params to pass through OAuth flow
	const returnUrl = url.searchParams.get('return') || '/';

	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: [scope],
		prompt: 'consent',
		state: returnUrl
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: authUrl
		}
	});
};
