import {
	defineCustomServerStrategy,
	deLocalizeUrl,
	extractLocaleFromHeader,
	extractLocaleFromUrl,
	type Locale,
	toLocale
} from '$lib/paraglide/runtime';

/**
 * Holds the language a visitor picked in the language switcher. Only the
 * switcher writes it, so opening a localized link never changes it.
 */
export const chosenLocaleCookie = 'FUIZ_LOCALE';

export function hasLocalePrefix(url: URL): boolean {
	return deLocalizeUrl(url).pathname !== url.pathname;
}

/** A locale prefix in the URL always wins. */
function localeFromPrefix(request: Request): Locale | undefined {
	const url = new URL(request.url);
	return hasLocalePrefix(url) ? extractLocaleFromUrl(url) : undefined;
}

function localeFromChoice(request: Request): Locale | undefined {
	const prefix = `${chosenLocaleCookie}=`;
	return toLocale(
		request.headers
			.get('cookie')
			?.split(';')
			.map((cookie) => cookie.trim())
			.find((cookie) => cookie.startsWith(prefix))
			?.slice(prefix.length)
	);
}

/**
 * Registers the server side of the strategies in `vite.config.ts`. Paraglide
 * runs custom strategies before built-in ones, so a URL without a locale prefix
 * resolves to the chosen language, then `Accept-Language`, and only then to the
 * base locale through `url`. `paraglideMiddleware` redirects to the localized
 * URL whenever that differs from the base locale.
 *
 * The client registers none of them and resolves through `url` alone: the
 * server has already redirected any URL that would resolve differently.
 */
export function defineServerLocaleStrategies() {
	const fromRequest = (getLocale: (request: Request) => Locale | undefined) => ({
		getLocale: (request?: Request) => request && getLocale(request)
	});
	defineCustomServerStrategy('custom-prefix', fromRequest(localeFromPrefix));
	defineCustomServerStrategy('custom-choice', fromRequest(localeFromChoice));
	defineCustomServerStrategy('custom-acceptLanguage', fromRequest(extractLocaleFromHeader));
}
