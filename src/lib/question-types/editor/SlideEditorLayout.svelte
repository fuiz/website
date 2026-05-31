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
	<div class="header-row">
		<div class="media-cell">{@render media?.()}</div>
		<div class="title-cell">{@render title?.()}</div>
	</div>
	{@render children?.()}
</div>

<style>
	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		padding: 0.6em 0.4em 0.4em;
		align-items: center;
		justify-content: space-between;
	}

	.header-row {
		display: flex;
		flex-wrap: wrap-reverse;
		width: 100%;
		justify-content: center;
		align-items: end;
		max-width: 30ch;
		gap: 0.2em;
	}

	.media-cell {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title-cell {
		max-width: 25ch;
		flex: 1;
		min-width: fit-content;
		padding-top: 0.5em;
		overflow: auto;
	}
</style>
