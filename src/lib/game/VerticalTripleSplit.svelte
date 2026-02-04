<script>
	/** @type {{ top?: import('svelte').Snippet, center?: import('svelte').Snippet, bottom?: import('svelte').Snippet }} */
	let { top, center, bottom } = $props();
</script>

<div style:height="100%" style:display="grid" style:grid-template-rows="auto 1fr auto">
	{@render top?.()}
	<div
		style:flex="1"
		style:display="flex"
		style:flex-direction="column"
		style:align-items="center"
		style:justify-content="center"
		style:position="relative"
	>
		{@render center?.()}
	</div>
	{@render bottom?.()}
</div>
