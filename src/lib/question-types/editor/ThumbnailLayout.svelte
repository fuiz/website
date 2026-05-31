<script lang="ts">
	import type { Snippet } from 'svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';

	let {
		title,
		media,
		warning,
		children
	}: {
		title: string;
		media?: Media;
		warning?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="thumb">
	<div class="title">{title || '...'}</div>
	<VerticalSplit>
		{#snippet top()}
			{#if media}
				<div class="media">
					<MediaContainer {media} />
				</div>
			{/if}
		{/snippet}
		{#snippet bottom()}
			{#if warning}
				<div class="warn">{warning}</div>
			{:else}
				{@render children?.()}
			{/if}
		{/snippet}
	</VerticalSplit>
</div>

<style>
	.thumb {
		display: flex;
		gap: 0.2em;
		height: 100%;
		overflow: hidden;
		flex-direction: column;
		justify-content: space-between;
		background: var(--surface);
	}

	.title {
		padding: 0.2em;
		box-sizing: border-box;
		box-shadow: 0 2px 2px #00000040;
		text-align: center;
		font-size: 0.8em;
		white-space: nowrap;
	}

	.media {
		height: 50px;
	}

	.warn {
		font-size: 18px;
		padding: 0.2em 0.1em;
		font-weight: bold;
		background: #f5c211;
		flex: 1;
	}
</style>
