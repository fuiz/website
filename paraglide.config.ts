import type { CompilerOptions } from '@inlang/paraglide-js';

/** How the translations compile, shared by the Vite build and the tests. */
export const paraglideOptions = {
	project: './project.inlang',
	outdir: './src/lib/paraglide',
	strategy: ['custom-prefix', 'custom-choice', 'custom-acceptLanguage', 'url', 'baseLocale'],
	// Routes outside src/routes/[[locale]] are never localized
	routeStrategies: [
		{ match: '/api/:path(.*)?', exclude: true },
		{ match: '/robots.txt', exclude: true },
		{ match: '/sitemap.xml', exclude: true }
	],
	trailingSlash: 'never'
} satisfies CompilerOptions;
