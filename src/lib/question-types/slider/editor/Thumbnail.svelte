<script lang="ts">
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintSlider } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { SliderSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: SliderSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintSlider(slide)));

	let span = $derived(Math.max(slide.range.max - slide.range.min, Number.EPSILON));
	let correctOffset = $derived(
		Math.min(100, Math.max(0, ((slide.correct - slide.range.min) / span) * 100))
	);
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="rail">
		<span class="mark" style:--x="{correctOffset}%"></span>
	</div>
	<div class="ends">
		<span>{slide.range.min}</span>
		<span>{slide.range.max}</span>
	</div>
</ThumbnailLayout>

<style>
	.rail {
		position: relative;
		height: 0.4em;
		margin: 0.4em 0.5em 0.2em;
		border-radius: 1em;
		background: color-mix(in srgb, currentColor 25%, transparent);
	}

	.mark {
		position: absolute;
		left: var(--x);
		top: 50%;
		transform: translate(-50%, -50%);
		width: 0.7em;
		height: 0.7em;
		border-radius: 50%;
		background: var(--primary);
	}

	.ends {
		display: flex;
		justify-content: space-between;
		padding: 0 0.5em 0.3em;
		font-size: 0.6em;
		opacity: 0.65;
	}
</style>
