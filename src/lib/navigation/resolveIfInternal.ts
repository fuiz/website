import { resolve } from '$app/paths';

function isExternal(href: string): boolean {
	return href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
}

export function resolveIfInternal(href: string): string {
	return isExternal(href) ? href : resolve(href);
}
