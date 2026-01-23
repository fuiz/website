import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
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
