import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { localizeHref } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

// Picking a quiz to host is what the gallery already does; a second picker was a copy of it.
export const load: PageLoad = () => {
	redirect(307, resolve(localizeHref('/create')));
};
