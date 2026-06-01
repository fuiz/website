<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import type { IdlessMultipleChoiceSlide } from '$lib/types';
	import Check from '~icons/custom/check';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessMultipleChoiceSlide;
		showAnswers: boolean;
	} = $props();

	let correctSet = $derived(
		showAnswers ? new Set(slide.answers.flatMap((a, i) => (a.correct ? [i] : []))) : undefined
	);
</script>

<div class="answers" class:revealed={showAnswers}>
	{#each slide.answers as answer, answerIndex (answerIndex)}
		<div class={['bar', paletteClass(answerIndex)]}>
			{#if correctSet?.has(answerIndex)}
				<span class="bar-check">
					<Check height="0.9em" width="0.9em" title={m.correct()} />
				</span>
			{/if}
			{#if showAnswers}
				<span class="bar-text">{answer.content.Text}</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.answers {
		flex-shrink: 0;
		display: grid;
		gap: 0.3em;
		padding: 0.4em;
		font-size: 0.85em;
		grid-template-columns: 1fr 1fr;
	}

	.answers.revealed {
		grid-template-columns: 1fr;
	}

	.bar {
		min-height: 1.2em;
		padding: 0.15em 0.4em;
		border-radius: 0.4em;
		border: 1px solid var(--btn-deep);
		background-color: var(--btn-bg);
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3em;
	}

	.bar-check {
		display: inline-flex;
		flex-shrink: 0;
	}

	.bar-text {
		flex: 1;
		min-width: 0;
		text-align: center;
		word-break: break-word;
		line-height: 1.2;
	}
</style>
