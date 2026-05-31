<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		media,
		title,
		children
	}: {
		media?: Snippet;
		title?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="editor">
	<div class="header">
		<div class="title-cell">{@render title?.()}</div>
		<div class="media-cell">{@render media?.()}</div>
	</div>
	{@render children?.()}
</div>

<style>
	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		padding: 0.6em 0.4em 0.4em;
		align-items: center;
		justify-content: space-between;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width: 100%;
		max-width: 32ch;
	}

	.title-cell {
		width: 100%;
		text-align: center;
	}

	.media-cell {
		display: flex;
		justify-content: center;
		width: 100%;
	}
</style>
