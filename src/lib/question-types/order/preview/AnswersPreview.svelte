<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import type { IdlessOrderSlide } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessOrderSlide;
		showAnswers: boolean;
	} = $props();
</script>

<div class="answers">
	{#if slide.axis_labels.from}
		<div class="axis-label">{slide.axis_labels.from}</div>
	{/if}
	{#each slide.answers as answer, answerIndex (answerIndex)}
		<div class={['bar', paletteClass(answerIndex)]}>
			<span class="bar-num">{answerIndex + 1}</span>
			{#if showAnswers}
				<span class="bar-text">{answer}</span>
			{/if}
		</div>
	{/each}
	{#if slide.axis_labels.to}
		<div class="axis-label">{slide.axis_labels.to}</div>
	{/if}
</div>

<style>
	.answers {
		flex-shrink: 0;
		display: grid;
		gap: 0.3em;
		padding: 0.4em;
		font-size: 0.85em;
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

	.bar-num {
		font-weight: 700;
		flex-shrink: 0;
		font-family: var(--alternative-font);
	}

	.bar-text {
		flex: 1;
		min-width: 0;
		text-align: center;
		word-break: break-word;
		line-height: 1.2;
	}

	.axis-label {
		text-align: center;
		font-size: 0.85em;
		opacity: 0.6;
		font-style: italic;
	}
</style>
