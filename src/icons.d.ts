declare module '~icons/*' {
	const component: import('svelte').Component<
		import('svelte/elements').SvelteHTMLElements['svg'] & { title?: string }
	>;

	export default component;
}
