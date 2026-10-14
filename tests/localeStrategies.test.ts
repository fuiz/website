import { describe, expect, it } from 'vitest';
import { defineServerLocaleStrategies } from '../src/lib/localeStrategies';
import { paraglideMiddleware } from '../src/lib/paraglide/server';

defineServerLocaleStrategies();

async function visit(path: string, headers: Record<string, string> = {}) {
	const request = new Request(`https://fuiz.org${path}`, {
		headers: { 'sec-fetch-dest': 'document', ...headers }
	});
	const response = await paraglideMiddleware(request, ({ locale }) => new Response(locale));
	return response.status === 307
		? { redirect: new URL(response.headers.get('location') ?? '').pathname }
		: { locale: await response.text() };
}

describe('locale strategies', () => {
	it('serves the base locale without a preference', async () => {
		expect(await visit('/')).toEqual({ locale: 'en' });
	});

	it('sends an unprefixed URL to the chosen language', async () => {
		expect(await visit('/', { cookie: 'FUIZ_LOCALE=de' })).toEqual({ redirect: '/de' });
		expect(await visit('/share/abcd', { cookie: 'a=b; FUIZ_LOCALE=de' })).toEqual({
			redirect: '/de/share/abcd'
		});
	});

	it('keeps the base locale when it was chosen', async () => {
		expect(
			await visit('/', { cookie: 'FUIZ_LOCALE=en', 'accept-language': 'de-DE,de;q=0.9' })
		).toEqual({ locale: 'en' });
	});

	it('falls back to Accept-Language', async () => {
		expect(await visit('/', { 'accept-language': 'fr-CA,fr;q=0.9,en;q=0.8' })).toEqual({
			redirect: '/fr'
		});
	});

	it('lets a locale prefix win over the choice and Accept-Language', async () => {
		const headers = { cookie: 'FUIZ_LOCALE=de', 'accept-language': 'fr' };
		expect(await visit('/it/quiz/1', headers)).toEqual({ locale: 'it' });
		expect(await visit('/en', headers)).toEqual({ locale: 'en' });
	});

	it('ignores the cookie paraglide writes on its own', async () => {
		expect(await visit('/', { cookie: 'PARAGLIDE_LOCALE=de' })).toEqual({ locale: 'en' });
	});

	it('ignores unknown locales', async () => {
		expect(await visit('/', { cookie: 'FUIZ_LOCALE=xx' })).toEqual({ locale: 'en' });
	});

	it('leaves routes that are not localized alone', async () => {
		const headers = { cookie: 'FUIZ_LOCALE=de', 'accept-language': 'fr' };
		expect(await visit('/api/git/login?return=/publish', headers)).toEqual({ locale: 'en' });
		expect(await visit('/robots.txt', headers)).toEqual({ locale: 'en' });
		expect(await visit('/sitemap.xml', headers)).toEqual({ locale: 'en' });
	});

	it('does not redirect requests that are not documents', async () => {
		const request = new Request('https://fuiz.org/', { headers: { cookie: 'FUIZ_LOCALE=de' } });
		const response = await paraglideMiddleware(request, () => new Response('ok'));
		expect(response.status).toBe(200);
	});
});
