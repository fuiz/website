import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const messagesDir = join(import.meta.dirname, '..', 'messages');

/**
 * Load translation key-value pairs for a given locale.
 * @param {string} locale - Locale code (e.g. 'en', 'ar', 'de'). Defaults to 'en'.
 * @returns {Record<string, string>} Map of translation keys to their translated strings.
 */
export function getTranslations(locale = 'en') {
	const data = JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), 'utf-8'));
	delete data.$schema;
	return data;
}

/**
 * List all available locale codes by scanning the messages directory.
 * @returns {string[]} Array of locale codes (e.g. ['ar', 'az', 'de', 'en', ...]).
 */
export function getLocales() {
	return readdirSync(messagesDir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.replace('.json', ''));
}
