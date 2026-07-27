<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintBrainstorm } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { BrainstormSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: BrainstormSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintBrainstorm(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="notes">
		{#each [0, 1, 2, 3] as i (i)}
			<span class={['note', paletteClass(i)]}></span>
		{/each}
	</div>
</ThumbnailLayout>

<style>
	.notes {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.15em;
		padding: 0.25em;
	}

	.note {
		aspect-ratio: 1;
		border-radius: 0.2em;
		background: var(--btn-bg);
	}
</style>
