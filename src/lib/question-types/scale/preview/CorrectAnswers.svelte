<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { ScaleSlide } from '$lib/types';

	let { slide }: { slide: ScaleSlide } = $props();
</script>

<div class="summary">
	{slide.style === 'Nps' ? m.nps_scale() : m.scale()} · {slide.min}–{slide.max}
</div>
{#if slide.labels.low || slide.labels.high}
	<div class="labels">
		{slide.labels.low ?? ''}{slide.labels.low && slide.labels.high ? ' → ' : ''}{slide.labels
			.high ?? ''}
	</div>
{/if}
<div class="note">{m.opinion_no_correct()}</div>

<style>
	.summary {
		font-size: 0.95em;
	}

	.labels {
		font-size: 0.85em;
		opacity: 0.75;
	}

	.note {
		font-size: 0.8em;
		font-style: italic;
		opacity: 0.6;
	}
</style>
