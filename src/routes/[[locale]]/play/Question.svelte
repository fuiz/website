<script lang="ts">
	import { env } from '$env/dynamic/public';
	import TextBar from '$lib/game/TextBar.svelte';
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media } from '$lib/types';

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

<PlayerLayout {name} {score}>
	<div class="content" class:has-media={media !== undefined}>
		{#if media}
			<div class="media">
				<ZoomableImage {media} />
			</div>
		{/if}
		<TextBar text={questionText} />
	</div>
</PlayerLayout>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		/* Safe, so a long question scrolls instead of running off the top. */
		justify-content: safe center;
		/* Enters after the slide announcement has flown out. */
		animation: question-reveal 0.45s cubic-bezier(0.2, 1.1, 0.3, 1) 0.56s backwards;
	}

	@keyframes question-reveal {
		from {
			opacity: 0;
			transform: translateY(0.5em) scale(0.96);
		}

		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.content {
			animation: none;
		}
	}

	.content.has-media {
		justify-content: start;
	}

	/* Up to 40vh; gives up height before the rest is squeezed, down to 20dvh. */
	.media {
		flex: 0 1 40vh;
		min-height: 20dvh;
		padding: 0.5em;
		box-sizing: border-box;
	}
</style>
