<script lang="ts">
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';

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

<div class="card">
	<div class="media" style:aspect-ratio={aspectRatio}>
		<MediaContainer {media} fit="cover" />
	</div>
	<div class="info">
		<div class="title">{title}</div>
		{#if subtitle}
			<div class="subtitle">{subtitle}</div>
		{/if}
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		overflow: hidden;
	}

	.media {
		position: relative;
		width: 100%;
	}

	.info {
		padding: 0.4em 0.6em;
		border-top: 1px solid var(--outline);
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
