import { options } from '../driveUtil';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const googleCookie = cookies.get('google');
	const isAuthenticated = !!googleCookie;

	const { clientId, clientSecret } = options();
	const isAvailable = !!(clientId && clientSecret);

	return new Response(
		JSON.stringify({
			authenticated: isAuthenticated,
			available: isAvailable
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};
