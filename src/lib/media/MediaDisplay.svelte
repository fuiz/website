<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { Media } from '$lib/types';
	import MediaFallback from './MediaFallback.svelte';

	let { media, fit }: { media: Media; fit: string } = $props();
</script>

{#if 'Base64' in media.Image}
	{#if media.Image.Base64.data !== ''}
		<img
			style:display="flex"
			style:height="100%"
			style:width="100%"
			style:object-fit={fit}
			alt={media.Image.Base64.alt}
			src={media.Image.Base64.data}
		/>
	{:else}
		<MediaFallback />
	{/if}
{:else if 'Corkboard' in media.Image}
	<img
		style:display="flex"
		style:height="100%"
		style:width="100%"
		style:object-fit={fit}
		src={env.PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id}
		alt={media.Image.Corkboard.alt}
	/>
{:else if 'Url' in media.Image}
	<img
		style:display="flex"
		style:height="100%"
		style:width="100%"
		style:object-fit={fit}
		src={media.Image.Url.url}
		alt={media.Image.Url.alt}
	/>
{/if}
