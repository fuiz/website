import { readdirSync, statSync } from 'node:fs';
import { compile } from '@inlang/paraglide-js';
import { Glob, plugin } from 'bun';
import { paraglideOptions } from '../paraglide.config';

// The compiled translations are not committed, and outside Vite nothing else
// builds them. Compiling takes seconds, so it is skipped while the output is
// newer than everything it is built from.
const root = `${import.meta.dir}/..`;
const modified = (path: string) => statSync(path, { throwIfNoEntry: false })?.mtimeMs;
const built = modified(`${root}/src/lib/paraglide/runtime.js`);
const sources = [
	`${root}/paraglide.config.ts`,
	`${root}/project.inlang/settings.json`,
	...readdirSync(`${root}/messages`).map((file) => `${root}/messages/${file}`)
];
if (built === undefined || sources.some((source) => (modified(source) ?? Infinity) > built)) {
	await compile(paraglideOptions);
}

// Modules that exist only inside the Vite build, where SvelteKit and
// unplugin-icons make them up. The tests exercise plain logic that imports
// them in passing, so each loads as a stand-in that does nothing.
const sveltekit: Record<string, string> = {
	'$app/environment': `
		export const browser = false;
		export const dev = false;
		export const building = false;
		export const version = 'test';
	`,
	'$app/navigation': `
		const nothing = async () => {};
		export const goto = nothing;
		export const invalidate = nothing;
		export const invalidateAll = nothing;
		export const preloadCode = nothing;
		export const preloadData = nothing;
		export const pushState = () => {};
		export const replaceState = () => {};
		export const beforeNavigate = () => {};
		export const afterNavigate = () => {};
		export const onNavigate = () => {};
		export const disableScrollHandling = () => {};
	`,
	'$app/paths': `
		export const base = '';
		export const assets = '';
		export const resolve = (path) => path;
		export const asset = (path) => path;
		export const resolveRoute = (path) => path;
	`,
	'$app/state': `
		export const page = { url: new URL('http://localhost/'), params: {}, data: {}, form: undefined, state: {} };
		export const navigating = { from: null, to: null, type: null };
		export const updated = { current: false, check: async () => false };
	`,
	'$env/dynamic/public': 'export const env = process.env;',
	'$env/dynamic/private': 'export const env = process.env;'
};

// Bun's virtual modules match whole names, not patterns, so every icon the
// source asks for is found up front.
const icons = new Set<string>();
for await (const file of new Glob('**/*.{ts,js,svelte}').scan(`${root}/src`)) {
	const source = await Bun.file(`${root}/src/${file}`).text();
	for (const [, name] of source.matchAll(/['"](~icons\/[^'"]+)['"]/g)) {
		icons.add(name);
	}
}

plugin({
	name: 'build-only modules',
	setup(build) {
		for (const [name, contents] of Object.entries(sveltekit)) {
			build.module(name, () => ({ contents, loader: 'js' }));
		}
		for (const name of icons) {
			build.module(name, () => ({ contents: 'export default function Icon() {}', loader: 'js' }));
		}
	}
});
