<script lang="ts">
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintScale } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { ScaleSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: ScaleSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintScale(slide)));

	let points = $derived(
		slide.max >= slide.min
			? Array.from({ length: slide.max - slide.min + 1 }, (_, i) => slide.min + i)
			: []
	);
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="points">
		{#each points as point (point)}
			<span class="point">{point}</span>
		{/each}
	</div>
</ThumbnailLayout>

<style>
	.points {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.15em;
		padding: 0.3em;
	}

	.point {
		min-width: 1.2em;
		text-align: center;
		font-size: 0.6em;
		padding: 0.1em;
		border-radius: 0.25em;
		background: color-mix(in srgb, currentColor 15%, transparent);
	}
</style>
