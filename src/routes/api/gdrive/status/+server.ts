import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const googleCookie = cookies.get('google');
	const isAuthenticated = !!googleCookie;

	return new Response(
		JSON.stringify({
			authenticated: isAuthenticated
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};
