<script lang="ts">
	import type { Media } from '$lib/types';
	import { getImageInfo } from './imageInfo';
	import MediaFallback from './MediaFallback.svelte';

	let { media, fit }: { media: Media; fit: string } = $props();

	let info = $derived(getImageInfo(media));
</script>

{#if info}
	<img class="img" style:--fit={fit} alt={info.alt} src={info.src} />
{:else}
	<MediaFallback />
{/if}

<style>
	.img {
		display: flex;
		height: 100%;
		width: 100%;
		object-fit: var(--fit);
	}
</style>
