import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const body = `User-agent: *
Allow: /

Sitemap: ${url.origin}/sitemap.xml`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain'
		}
	});
};
