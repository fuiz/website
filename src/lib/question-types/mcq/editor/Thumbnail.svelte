<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintMultipleChoice } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { MultipleChoiceSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: MultipleChoiceSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintMultipleChoice(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="bars">
		{#each slide.answers as answer, i (answer.id)}
			<div class={['bar', paletteClass(i)]}></div>
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
		background: var(--btn-bg);
		height: 0.5em;
		border-radius: 0.7em;
	}
</style>
