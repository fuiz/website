<script lang="ts">
	import EmptyAnswerButton from './EmptyAnswerButton.svelte';
	import TextAnswerButton from './TextAnswerButton.svelte';

	let {
		answers,
		selected,
		onanswer
	}: {
		answers: { text: string | undefined; correct: boolean | undefined }[];
		selected?: Set<number>;
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
	let anySelected = $derived((selected?.size ?? 0) > 0);
</script>

<div id="container">
	<div id="inner">
		{#each answersFiltered.knownAnswers as answer (answer.index)}
			<TextAnswerButton
				index={answer.index}
				answerText={answer.text}
				correct={answer.correct}
				selected={selected?.has(answer.index)}
				dimmed={anySelected && !selected?.has(answer.index)}
				onclick={() => {
					if (onanswer) onanswer(answer.index);
				}}
			/>
		{/each}
		{#each answersFiltered.unknownAnswers as { index } (index)}
			<EmptyAnswerButton
				{index}
				selected={selected?.has(index)}
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

	@container (width <= 40ch) {
		#inner {
			grid-template-columns: 1fr;
		}
	}
</style>
