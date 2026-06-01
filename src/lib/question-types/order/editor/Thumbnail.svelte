<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintOrder } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { OrderSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: OrderSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintOrder(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	{#each slide.answers as answer, i (answer.id)}
		<div class={['bar', paletteClass(i)]}></div>
	{/each}
</ThumbnailLayout>

<style>
	.bar {
		background: var(--btn-bg);
		margin: 0.1em;
		border-radius: 0.6em;
		height: 0.5em;
	}
</style>
