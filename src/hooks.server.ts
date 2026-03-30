import type { Handle } from '@sveltejs/kit';
import { createAI } from '$lib/ai/factory';
import { createBlobStorage } from '$lib/blob/factory';
import { createDatabase } from '$lib/db';
import { createKVStore } from '$lib/kv/factory';
import { deLocalizeUrl } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.database = await createDatabase(event.platform?.env?.DATABASE);
	event.locals.blobStorage = await createBlobStorage(event.platform?.env?.BUCKET);
	event.locals.ai = await createAI(event.platform?.env?.AI);
	event.locals.shareStore = await createKVStore(event.platform?.env?.MAP, 'kv_share');
	event.locals.publishJobsStore = await createKVStore(
		event.platform?.env?.PUBLISH_JOBS,
		'kv_publish_jobs'
	);
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
