<script lang="ts">
	import SliderTrack from '$lib/game/SliderTrack.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media, SliderRange } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';

	let {
		questionText,
		name,
		score,
		media,
		range,
		unit,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: Media | undefined;
		range: SliderRange;
		unit: string | undefined;
		showAnswers: boolean;
		onanswer: (value: number) => void;
	} = $props();

	// Start in the middle of the range, snapped to the step grid so the first
	// submitted value is one the slider can actually stop on. A slide never
	// swaps its range mid-question, so this is a starting point, not a mirror.
	// svelte-ignore state_referenced_locally
	let value = $state(midpoint(range));

	function midpoint(of: SliderRange): number {
		return of.min + Math.round((of.max - of.min) / 2 / of.step) * of.step;
	}
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
		<form
			class="content"
			onsubmit={(event) => {
				event.preventDefault();
				onanswer(value);
			}}
		>
			<SliderTrack {range} {unit} bind:value interactive />
			<FancyButton onclick={() => onanswer(value)}>
				<div class="submit">{m.submit()}</div>
			</FancyButton>
		</form>
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
		gap: 1.5em;
		padding: 1.2em;
		font-size: 1.1em;
	}

	.submit {
		padding: 0.2em 0.6em;
	}
</style>
