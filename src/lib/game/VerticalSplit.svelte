<script>
	/** @type {{ top?: import('svelte').Snippet; bottom?: import('svelte').Snippet }}*/
	let { top, bottom } = $props();
</script>

<div
	style:height="100%"
	style:display="grid"
	style:grid-template-rows="1fr auto"
	style:flex-direction="column"
>
	<div
		style:flex="1"
		style:display="flex"
		style:flex-direction="column"
		style:align-items="center"
		style:justify-content="center"
		style:position="relative"
	>
		{@render top?.()}
	</div>
	{@render bottom?.()}
</div>
