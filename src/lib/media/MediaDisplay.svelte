<script lang="ts">
	import type { Media } from '$lib/types';
	import { getImageInfo } from './imageInfo';
	import MediaFallback from './MediaFallback.svelte';

	let { media, fit }: { media: Media; fit: string } = $props();

	let info = $derived(getImageInfo(media));
</script>

{#if info}
	<img
		style:display="flex"
		style:height="100%"
		style:width="100%"
		style:object-fit={fit}
		alt={info.alt}
		src={info.src}
	/>
{:else}
	<MediaFallback />
{/if}
