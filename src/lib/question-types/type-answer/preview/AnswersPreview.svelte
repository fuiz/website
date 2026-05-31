<script lang="ts">
	import type { IdlessTypeAnswer } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessTypeAnswer;
		showAnswers: boolean;
	} = $props();
</script>

<div class="answers">
	{#if showAnswers}
		<span class="text">{slide.answers.join(' · ')}</span>
	{/if}
</div>

<style>
	.answers {
		flex-shrink: 0;
		margin: 0.4em;
		padding: 0.4em 0.6em;
		border: 1px dashed color-mix(in srgb, var(--on-surface) 30%, transparent);
		border-radius: 0.5em;
		min-height: 1.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85em;
	}

	.text {
		opacity: 0.85;
		text-align: center;
		word-break: break-word;
	}
</style>
