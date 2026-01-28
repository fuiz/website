import type { RequestHandler } from './$types';
import { options } from '../driveUtil';

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
