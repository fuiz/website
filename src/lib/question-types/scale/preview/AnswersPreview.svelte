<script lang="ts">
	import type { IdlessScaleSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: IdlessScaleSlide;
	} = $props();

	let points = $derived(
		slide.max >= slide.min
			? Array.from({ length: slide.max - slide.min + 1 }, (_, i) => slide.min + i)
			: []
	);
</script>

<div class="preview">
	<div class="points">
		{#each points as point (point)}
			<span class="point">{point}</span>
		{/each}
	</div>
	<div class="labels">
		<span>{slide.labels.low ?? ''}</span>
		<span class="high">{slide.labels.high ?? ''}</span>
	</div>
</div>

<style>
	.preview {
		flex-shrink: 0;
		padding: 0.4em 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}

	.points {
		display: flex;
		gap: 0.2em;
		justify-content: center;
		flex-wrap: wrap;
	}

	.point {
		min-width: 1.4em;
		padding: 0.1em 0.2em;
		text-align: center;
		border-radius: 0.3em;
		border: 1px solid color-mix(in srgb, var(--on-surface) 25%, transparent);
		font-family: var(--alternative-font);
		font-size: 0.8em;
	}

	.labels {
		display: flex;
		justify-content: space-between;
		gap: 0.4em;
		font-size: 0.7em;
		opacity: 0.65;
	}

	.high {
		text-align: end;
	}
</style>
