import type { RequestHandler } from './$types';
import { options, scope } from '../driveUtil';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const { clientId, redirectUri } = options();

	if (!clientId || !redirectUri) {
		error(500, 'Google Drive OAuth not configured');
	}

	// Get the return URL from query params to pass through OAuth flow
	const returnUrl = url.searchParams.get('return') || '/';

	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', scope);
	authUrl.searchParams.set('access_type', 'offline');
	authUrl.searchParams.set('prompt', 'consent');
	authUrl.searchParams.set('state', returnUrl);

	return new Response(null, {
		status: 302,
		headers: {
			Location: authUrl.toString()
		}
	});
};
