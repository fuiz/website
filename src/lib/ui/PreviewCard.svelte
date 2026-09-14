<script lang="ts">
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';
	import Card from '$lib/ui/Card.svelte';

	let {
		media,
		title,
		subtitle,
		aspectRatio = '6 / 5'
	}: {
		media: Media | undefined;
		title: string;
		subtitle?: string;
		aspectRatio?: string;
	} = $props();
</script>

<Card padding="0">
	<div class="media" style:--aspect={aspectRatio}>
		<MediaContainer {media} fit="cover" />
	</div>
	<div class="info">
		<div class="title">{title}</div>
		{#if subtitle}
			<div class="subtitle">{subtitle}</div>
		{/if}
	</div>
</Card>

<style>
	.media {
		position: relative;
		width: 100%;
		aspect-ratio: var(--aspect);
	}

	.info {
		padding: 0.4em 0.6em;
	}

	.title {
		font-weight: 600;
		word-break: break-word;
	}

	.subtitle {
		font-size: 0.8em;
		opacity: 0.7;
		margin-top: 0.1em;
	}
</style>
