<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { PinSlide } from '$lib/types';

	let { slide }: { slide: PinSlide } = $props();

	function shapeName(shape: NonNullable<PinSlide['correct_area']>): string {
		if ('Rectangle' in shape) return m.tool_rectangle();
		if ('Ellipse' in shape) return m.tool_ellipse();
		return m.tool_freehand();
	}
</script>

{#if slide.correct_area}
	<div class="answer">{shapeName(slide.correct_area)}</div>
	<div class="note">{m.target_note()}</div>
{:else}
	<div class="note">{m.opinion_no_correct()}</div>
{/if}

<style>
	.answer {
		font-size: 0.95em;
	}

	.note {
		font-size: 0.8em;
		font-style: italic;
		opacity: 0.65;
	}
</style>
