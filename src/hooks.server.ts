import type { Handle } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = ({ event, resolve }) => {
	if (!event.route.id?.startsWith('/[[lang]]')) {
		// If the route is not localized
		const delocalizedUrl = deLocalizeUrl(event.request.url).pathname;
		const originalUrl = new URL(event.request.url).pathname;
		// and the delocalized URL differs from the original URL,
		// return a 404 response
		if (delocalizedUrl !== originalUrl) {
			return new Response(null, {
				status: 404
			});
		}
	}

	return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%paraglide.lang%', locale).replace(
					'%paraglide.textDirection%',
					{
						ar: 'rtl',
						az: 'ltr',
						de: 'ltr',
						en: 'ltr',
						es: 'ltr',
						eu: 'ltr',
						fr: 'ltr',
						id: 'ltr',
						it: 'ltr',
						nl: 'ltr',
						pl: 'ltr',
						'zh-cn': 'ltr'
					}[locale] ?? 'ltr'
				);
			}
		});
	});
};
