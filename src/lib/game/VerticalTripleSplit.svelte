<script lang="ts">
	import type { Snippet } from 'svelte';

	let { top, center, bottom }: { top?: Snippet; center?: Snippet; bottom?: Snippet } = $props();
</script>

<div class="root">
	{@render top?.()}
	<div class="center">
		{@render center?.()}
	</div>
	{@render bottom?.()}
</div>

<style>
	.root {
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	.center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}
</style>
