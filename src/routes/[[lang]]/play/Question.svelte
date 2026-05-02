<script lang="ts">
	import { env } from '$env/dynamic/public';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';
	import Topbar from './Topbar.svelte';

	let {
		name,
		score,
		questionText,
		media
	}: {
		name: string;
		score: number;
		questionText: string;
		media: Media | undefined;
	} = $props();
</script>

<svelte:head>
	{#if media && 'Corkboard' in media.Image}
		<link
			rel="preload"
			as="image"
			href={env.PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id}
		/>
	{/if}
</svelte:head>

<div class="page">
	<Topbar {name} {score} />
	<NiceBackground>
		<div class="body" class:has-media={media !== undefined}>
			{#if media}
				<div class="media">
					<div class="media-inner">
						<MediaContainer {media} fit="contain" />
					</div>
				</div>
			{/if}
			<TextBar text={questionText} />
		</div>
	</NiceBackground>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.body {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.body.has-media {
		justify-content: start;
	}

	.media {
		height: 40vh;
		padding: 0.5em;
		box-sizing: border-box;
	}

	.media-inner {
		position: relative;
		height: 100%;
	}
</style>
