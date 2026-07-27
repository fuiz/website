<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintPin } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { PinSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: PinSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintPin(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	<div class="label">
		{slide.correct_area ? m.pin_answer() : m.drop_pin()}
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
