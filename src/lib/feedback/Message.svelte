<script>
	/** @type {{
	 *  message: string;
	 *  icon: import('svelte').Snippet;
	 *  background: string;
	 *  color: string;
	}} */
	let { message, icon, background, color } = $props();
</script>

{#if message}
	<div
		style:width="100%"
		style:display="flex"
		style:align-items="center"
		style:background
		style:padding="5px 10px"
		style:box-sizing="border-box"
		style:border-radius="5px"
		style:gap="10px"
		style:color
		style:font-weight="bold"
		style:border="1px solid {color}"
		style:word-wrap="anywhere"
	>
		{@render icon()}
		<div style:flex="1" style:text-align="center">
			{message}
		</div>
	</div>
{/if}
