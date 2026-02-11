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
			strategy: ['url', 'cookie', 'baseLocale']
		})
	]
});
