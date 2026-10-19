<script lang="ts">
	import ScalePicker from '$lib/game/ScalePicker.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media, ScaleLabels, ScaleStyle } from '$lib/types';

	let {
		questionText,
		name,
		score,
		media,
		points,
		labels,
		style,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: Media | undefined;
		points: number[];
		labels: ScaleLabels;
		style: ScaleStyle;
		showAnswers: boolean;
		onanswer: (value: number) => void;
	} = $props();

	let selected = $state<number | undefined>(undefined);
</script>

<PlayerLayout {name} {score}>
	{#snippet belowTopbar()}
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	{/snippet}
	<div class="stack">
		{#if media && showAnswers}
			<div class="media">
				<ZoomableImage {media} />
			</div>
		{/if}
		<div class="content" class:dense={style === 'Nps'}>
			<ScalePicker
				{points}
				{labels}
				{style}
				{selected}
				interactive
				onpick={(value) => {
					selected = value;
					onanswer(value);
				}}
			/>
		</div>
	</div>
</PlayerLayout>

<style>
	/* Scrolls only when the image at its smallest and the answers can't both fit. */
	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	/* Up to 35dvh; gives up height before the answers are squeezed, down to 20dvh. */
	.media {
		flex: 0 1 35dvh;
		min-height: 20dvh;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 1.2em;
		font-size: 1.15em;
	}

	.content.dense {
		font-size: 1em;
		padding: 0.8em;
	}
</style>
