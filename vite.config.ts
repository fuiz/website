import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { SvelteTitleCompiler } from './icon-compiler.js';

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: SvelteTitleCompiler,
			customCollections: {
				custom: FileSystemIconLoader('./src/lib/assets/icons')
			}
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['custom-prefix', 'custom-choice', 'custom-acceptLanguage', 'url', 'baseLocale'],
			// Routes outside src/routes/[[lang]] are never localized
			routeStrategies: [
				{ match: '/api/:path(.*)?', exclude: true },
				{ match: '/robots.txt', exclude: true },
				{ match: '/sitemap.xml', exclude: true }
			],
			trailingSlash: 'never'
		})
	],
	ssr: {
		noExternal: ['@thisux/sveltednd']
	}
});
