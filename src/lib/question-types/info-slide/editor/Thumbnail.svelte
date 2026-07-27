<script lang="ts">
	import ThumbnailLayout from '$lib/question-types/editor/ThumbnailLayout.svelte';
	import { lintInfoSlide } from '$lib/question-types/lint';
	import { lintIssueMessage } from '$lib/question-types/lintMessages';
	import type { InfoSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: InfoSlide;
	} = $props();

	let warning = $derived(lintIssueMessage(lintInfoSlide(slide)));
</script>

<ThumbnailLayout title={slide.title} media={slide.media} {warning}>
	{#if slide.body}
		<div class="body">{slide.body}</div>
	{/if}
</ThumbnailLayout>

<style>
	.body {
		padding: 0.2em 0.4em 0.3em;
		font-size: 0.55em;
		line-height: 1.3;
		opacity: 0.7;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
