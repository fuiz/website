<script lang="ts">
	import type { Snippet } from 'svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import { getImageInfo } from '$lib/media/imageInfo';
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

	let imageInfo = $derived(media ? getImageInfo(media) : undefined);
</script>

<div class="thumb">
	<div class="title">{title || '...'}</div>
	<VerticalSplit>
		{#snippet top()}
			{#if imageInfo}
				<div class="media">
					<img src={imageInfo.src} alt={imageInfo.alt} />
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
	}

	.title {
		padding: 0.2em;
		box-sizing: border-box;
		text-align: center;
		font-size: 0.8em;
		white-space: nowrap;
	}

	.media {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: 0.4em;
		box-sizing: border-box;
		overflow: hidden;
	}

	.media img {
		display: block;
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		border-radius: 0.25em;
	}

	.warn {
		font-size: 18px;
		padding: 0.2em 0.1em;
		font-weight: bold;
		background: #f5c211;
		flex: 1;
	}
</style>
