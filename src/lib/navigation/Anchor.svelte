<script>
	/** @type {{href: string, children?: import('svelte').Snippet}}*/
	let { href, children } = $props();
</script>

<a {href} target="_blank">
	{@render children?.()}
</a>

<style>
	a {
		text-decoration: none;
		--highlight: color-mix(in srgb, currentColor 20%, transparent);
		background: var(--highlight);
		color: inherit;
		padding: 0.05em 0.15em;
		border-radius: 0.15em;
		font-weight: bold;

		display: inline-flex;
		align-items: center;
	}

	a:focus,
	a:hover {
		outline: 0.15em solid var(--highlight);
		text-decoration: underline solid;
	}
</style>
