<script lang="ts">
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media } from '$lib/types';

	let {
		name,
		score,
		title,
		body,
		media,
		showAnswers
	}: {
		name: string;
		score: number;
		title: string;
		body: string | undefined;
		media: Media | undefined;
		/** When the host hides content from phones, players just see the heading. */
		showAnswers: boolean;
	} = $props();
</script>

<PlayerLayout {name} {score}>
	<div class="slide">
		{#if media && showAnswers}
			<div class="media">
				<ZoomableImage {media} />
			</div>
		{/if}
		<div class="text">
			<h1>{title}</h1>
			{#if body && showAnswers}
				<p>{body}</p>
			{/if}
		</div>
	</div>
</PlayerLayout>

<style>
	.slide {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* Safe, so a long body scrolls instead of running off the top. */
		justify-content: safe center;
		overflow-y: auto;
		gap: 0.8em;
		padding: 1.2em;
		box-sizing: border-box;
		text-align: center;
	}

	/* Up to 35dvh; gives up height before the text is squeezed, down to 20dvh. */
	.media {
		width: 100%;
		flex: 0 1 35dvh;
		min-height: 20dvh;
	}

	h1 {
		font-family: var(--alternative-font);
		font-size: 1.6em;
		line-height: 1.2;
		margin: 0 0 0.3em;
		overflow-wrap: anywhere;
	}

	p {
		margin: 0;
		line-height: 1.5;
		opacity: 0.85;
		white-space: pre-wrap;
	}
</style>
