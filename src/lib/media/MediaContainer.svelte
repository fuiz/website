<script lang="ts">
	import type { Media } from '$lib/types';
	import MediaDisplay from './MediaDisplay.svelte';
	import MediaFallback from './MediaFallback.svelte';

	let {
		media,
		align = 'center',
		fit = 'contain',
		showFallback = true
	}: {
		media: Media | undefined;
		align?: string;
		fit?: string;
		showFallback?: boolean;
	} = $props();
</script>

<div class="container" style:--align={align}>
	{#if media}
		<MediaDisplay {media} {fit} />
	{:else if showFallback}
		<MediaFallback />
	{/if}
</div>

<style>
	.container {
		max-height: 100%;
		max-width: 100%;
		display: flex;
		justify-content: var(--align);
		margin: auto;
		position: absolute;
		inset: 0;
	}
</style>
