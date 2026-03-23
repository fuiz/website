import type { RequestHandler } from '@sveltejs/kit';
import * as sitemap from 'super-sitemap';

export const prerender = false;

export const GET: RequestHandler = async ({ url }) => {
	const text = await (
		await sitemap.response({
			origin: url.origin,
			lang: {
				default: 'en',
				alternates: ['ar', 'az', 'de', 'es', 'eu', 'fr', 'it', 'id', 'nl', 'pl', 'zh-cn']
			},
			excludeRoutePatterns: ['.*\\[id\\].*']
		})
	).text();

	return new Response(text.replaceAll('https://www', 'http://www'), {
		headers: {
			'cache-control': 'max-age=0, s-maxage=3600',
			'content-type': 'text/xml'
		}
	});
};
