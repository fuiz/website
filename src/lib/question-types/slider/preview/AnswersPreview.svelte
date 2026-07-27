<script lang="ts">
	import { formatSliderValue } from '$lib/game/sliderFormat';
	import type { IdlessSliderSlide } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessSliderSlide;
		showAnswers: boolean;
	} = $props();

	let span = $derived(Math.max(slide.range.max - slide.range.min, Number.EPSILON));
	let correctOffset = $derived(
		Math.min(100, Math.max(0, ((slide.correct - slide.range.min) / span) * 100))
	);
</script>

<div class="preview">
	<div class="rail">
		{#if showAnswers}
			<span class="mark" style:--x="{correctOffset}%"></span>
		{/if}
	</div>
	<div class="ends">
		<span>{formatSliderValue(slide.range.min, slide.range, slide.unit ?? undefined)}</span>
		{#if showAnswers}
			<span class="correct"
				>{formatSliderValue(slide.correct, slide.range, slide.unit ?? undefined)}</span
			>
		{/if}
		<span>{formatSliderValue(slide.range.max, slide.range, slide.unit ?? undefined)}</span>
	</div>
</div>

<style>
	.preview {
		flex-shrink: 0;
		padding: 0.5em 0.6em;
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}

	.rail {
		position: relative;
		height: 0.5em;
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 20%, transparent);
	}

	.mark {
		position: absolute;
		left: var(--x);
		top: 50%;
		transform: translate(-50%, -50%);
		width: 0.8em;
		height: 0.8em;
		border-radius: 50%;
		background: var(--primary);
	}

	.ends {
		display: flex;
		justify-content: space-between;
		font-size: 0.75em;
		font-family: var(--alternative-font);
		opacity: 0.7;
	}

	.correct {
		opacity: 1;
		color: var(--primary);
		font-weight: 700;
	}
</style>
