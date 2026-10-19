<script lang="ts">
	import { fitMetrics } from '$lib/ui/FitText.svelte';
	import EmptyAnswerButton from './EmptyAnswerButton.svelte';
	import TextAnswerButton from './TextAnswerButton.svelte';

	let {
		answers,
		fill = false,
		onanswer
	}: {
		answers: { text: string | undefined; correct: boolean | undefined }[];
		/** Stretch equal-sized tiles over the available height and fit the text to them. */
		fill?: boolean;
		onanswer?: (index: number) => void;
	} = $props();

	type KnownAnswer = { index: number; text: string; correct: boolean | undefined };
	type UnknownAnswer = { index: number; correct: boolean | undefined };

	/**
	 * Filters an array of answers, separating them into two groups: known and unknown.
	 * 'Known' answers are assumed to have defined `text` and `correct` properties,
	 * while 'unknown' answers are placeholders that may lack these properties.
	 *
	 * @param answers - The array of answer objects to filter.
	 * @returns An object containing two arrays: one for answers with complete data (`knownAnswers`) and one for answers with incomplete data (`unknownAnswers`).
	 */
	function filterAnswers(answers: { text: string | undefined; correct: boolean | undefined }[]): {
		knownAnswers: KnownAnswer[];
		unknownAnswers: UnknownAnswer[];
	} {
		let knownAnswers: KnownAnswer[] = [];
		let unknownAnswers: UnknownAnswer[] = [];
		answers.forEach(({ text, correct }, index) => {
			if (text) {
				knownAnswers.push({
					index,
					text,
					correct
				});
			} else {
				unknownAnswers.push({
					index,
					correct
				});
			}
		});
		return {
			unknownAnswers,
			knownAnswers
		};
	}

	let answersFiltered = $derived(filterAnswers(answers));
	let fit = $derived(
		fill ? fitMetrics(answersFiltered.knownAnswers.map(({ text }) => text)) : undefined
	);
</script>

<div id="container">
	<div id="inner" class:fill>
		{#each answersFiltered.knownAnswers as answer (answer.index)}
			<TextAnswerButton
				index={answer.index}
				answerText={answer.text}
				correct={answer.correct}
				{fit}
				onclick={() => {
					if (onanswer) onanswer(answer.index);
				}}
			/>
		{/each}
		{#each answersFiltered.unknownAnswers as { index } (index)}
			<EmptyAnswerButton
				{index}
				onclick={() => {
					if (onanswer) onanswer(index);
				}}
			/>
		{/each}
	</div>
</div>

<style>
	#container {
		container-type: inline-size;
		height: 100%;
	}

	#inner {
		grid-template-columns: 1fr 1fr;
		height: 100%;
		display: grid;
		gap: 0.2em;
		padding: 0.2em;
		box-sizing: border-box;
		align-content: end;
	}

	/* Rows share the height equally; when the longest answer needs more than its share,
	   all rows grow to match and the grid runs past its box rather than squeezing it. */
	#inner.fill {
		height: auto;
		min-height: 100%;
		grid-auto-rows: minmax(2.5em, 1fr);
	}

	@container (width <= 40ch) {
		#inner {
			grid-template-columns: 1fr;
		}
	}
</style>
