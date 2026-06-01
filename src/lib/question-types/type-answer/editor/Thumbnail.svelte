<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintTypeAnswer } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { TypeAnswer } from '$lib/types';

	let {
		slide
	}: {
		slide: TypeAnswer;
	} = $props();

	let warning = $derived(lintIssueMessage(lintTypeAnswer(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	{#each slide.answers as answer, i (answer.id)}
		<div class={['bar', paletteClass(i)]}></div>
	{/each}
</ThumbnailLayout>

<style>
	.bar {
		border: 0.1em solid var(--btn-bg);
		margin: 0.1em;
		border-radius: 0.6em;
		height: 0.5em;
	}
</style>
