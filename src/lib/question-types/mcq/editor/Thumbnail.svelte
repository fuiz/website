<script lang="ts">
	import { buttonColors } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import type { MultipleChoiceSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: MultipleChoiceSlide;
	} = $props();

	let warning = $derived.by(() => {
		if (!slide.answers.length) return m.no_answers();
		if (slide.answers.some((a) => !a.content.Text.length)) return m.empty_answer();
		if (new Set(slide.answers.map((a) => a.content.Text)).size !== slide.answers.length)
			return m.duplicate_answers();
		if (slide.answers.every((a) => !a.correct)) return m.no_correct();
		return undefined;
	});
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="bars">
		{#each slide.answers as answer, i (answer.id)}
			<div
				class="bar"
				style:--bar-color={buttonColors.at(i % buttonColors.length)?.[0]}
			></div>
		{/each}
	</div>
</ThumbnailLayout>

<style>
	.bars {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.2em;
		padding: 0.2em;
	}

	.bar {
		background: var(--bar-color);
		height: 0.5em;
		border-radius: 0.7em;
	}
</style>
