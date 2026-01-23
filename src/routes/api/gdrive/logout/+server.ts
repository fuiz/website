import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.delete('google', {
		path: '/'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
};
