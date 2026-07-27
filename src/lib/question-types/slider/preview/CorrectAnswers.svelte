<script lang="ts">
	import { formatSliderValue } from '$lib/game/sliderFormat';
	import * as m from '$lib/paraglide/messages.js';
	import type { SliderSlide } from '$lib/types';

	let { slide }: { slide: SliderSlide } = $props();

	let unit = $derived(slide.unit ?? undefined);
</script>

<div class="answer">
	<strong>{formatSliderValue(slide.correct, slide.range, unit)}</strong>
	{#if slide.tolerance > 0}
		<span class="tolerance">
			± {formatSliderValue(slide.tolerance, slide.range, unit)}
		</span>
	{/if}
</div>
<div class="range">
	{m.range_label({
		from: formatSliderValue(slide.range.min, slide.range, unit),
		to: formatSliderValue(slide.range.max, slide.range, unit)
	})}
</div>

<style>
	.answer {
		font-size: 1.05em;
		display: flex;
		align-items: baseline;
		gap: 0.35em;
	}

	.tolerance {
		font-size: 0.85em;
		opacity: 0.75;
	}

	.range {
		font-size: 0.85em;
		font-style: italic;
		opacity: 0.7;
	}
</style>
