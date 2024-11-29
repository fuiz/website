import * as sitemap from 'super-sitemap';
import type { RequestHandler } from '@sveltejs/kit';

export const prerender = false;

export const GET: RequestHandler = async () => {
	const text = await (
		await sitemap.response({
			origin: 'https://fuiz.us',
			lang: {
				default: 'en',
				alternates: ['ar', 'az', 'de', 'es', 'fr', 'it', 'nl', 'zh-cn']
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
