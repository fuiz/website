<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintFreeText } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { FreeTextSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: FreeTextSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintFreeText(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="label">
		{slide.mode === 'WordCloud' ? m.word_cloud() : m.open_ended()}
	</div>
</ThumbnailLayout>

<style>
	.label {
		text-align: center;
		font-size: 0.65em;
		padding: 0.3em;
		opacity: 0.7;
	}
</style>
