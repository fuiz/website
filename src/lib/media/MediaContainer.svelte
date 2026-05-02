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

<div
	style:max-height="100%"
	style:display="flex"
	style:justify-content={align}
	style:max-width="100%"
	style:margin="auto"
	style:position="absolute"
	style:inset="0"
>
	{#if media}
		<MediaDisplay {media} {fit} />
	{:else if showFallback}
		<MediaFallback />
	{/if}
</div>
