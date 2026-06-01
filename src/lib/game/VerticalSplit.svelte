<script lang="ts">
	import type { Snippet } from 'svelte';

	let { top, bottom }: { top?: Snippet; bottom?: Snippet } = $props();
</script>

<div class="root">
	<div class="top">
		{@render top?.()}
	</div>
	{@render bottom?.()}
</div>

<style>
	.root {
		height: 100%;
		display: grid;
		grid-template-rows: 1fr auto;
		flex-direction: column;
	}

	.top {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}
</style>
