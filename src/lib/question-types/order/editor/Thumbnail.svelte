<script lang="ts">
	import { buttonColors } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import type { OrderSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: OrderSlide;
	} = $props();

	let warning = $derived.by(() => {
		if (!slide.answers.length) return m.no_answers();
		if (slide.answers.some((a) => !a.text.length)) return m.empty_answer();
		if (new Set(slide.answers.map((a) => a.text)).size !== slide.answers.length)
			return m.duplicate_answers();
		return undefined;
	});
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	{#each slide.answers as answer, i (answer.id)}
		<div
			class="bar"
			style:--bar-color={buttonColors.at(i % buttonColors.length)?.at(0) ?? 'var(--primary)'}
		></div>
	{/each}
</ThumbnailLayout>

<style>
	.bar {
		background: var(--bar-color);
		margin: 0.1em;
		border-radius: 0.6em;
		height: 0.5em;
	}
</style>
