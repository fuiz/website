import { default as cloudflareAdapter } from '@sveltejs/adapter-cloudflare';
import { default as nodeAdapter } from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const adapterName = process.env.ADAPTER || 'cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapterName === 'node' ? nodeAdapter() : cloudflareAdapter(),

		paths: {
			relative: false
		}
	}
};

export default config;
