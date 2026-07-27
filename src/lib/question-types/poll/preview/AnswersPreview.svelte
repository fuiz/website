<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import type { IdlessPollSlide } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessPollSlide;
		showAnswers: boolean;
	} = $props();
</script>

<div class="answers">
	{#each slide.answers as answer, index (index)}
		<div class={['bar', paletteClass(index)]}>
			{#if showAnswers}
				{answer.content.Text}
			{/if}
		</div>
	{/each}
</div>

<style>
	.answers {
		flex-shrink: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.3em;
		padding: 0.4em;
		font-size: 0.85em;
	}

	.bar {
		min-height: 1.4em;
		padding: 0.15em 0.3em;
		border-radius: 0.4em;
		border: 1px solid var(--btn-deep);
		background-color: var(--btn-bg);
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		word-break: break-word;
		line-height: 1.2;
	}
</style>
