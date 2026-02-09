<script>
	import EmptyAnswerButton from './EmptyAnswerButton.svelte';
	import TextAnswerButton from './TextAnswerButton.svelte';

	/** @type {{answers: { text: string | undefined; correct: boolean | undefined }[], onanswer?: (index: number) => void}}*/
	let { answers, onanswer } = $props();

	/** @typedef {{index: number, text: string, correct: (boolean|undefined)}} KnownAnswer */
	/** @typedef {{index: number, correct: (boolean|undefined)}} UnknownAnswer */

	/**
	 * Filters an array of answers, separating them into two groups: known and unknown.
	 * 'Known' answers are assumed to have defined `text` and `correct` properties,
	 * while 'unknown' answers are placeholders that may lack these properties.
	 *
	 * @param {{ text: string | undefined; correct: boolean | undefined }[]} answers - The array of answer objects to filter.
	 * @returns {{knownAnswers: KnownAnswer[], unknownAnswers: UnknownAnswer[]}} An object containing two arrays: one for answers with complete data (`knownAnswers`) and one for answers with incomplete data (`unknownAnswers`).
	 */
	function filterAnswers(answers) {
		/** @type {KnownAnswer[]} */
		let knownAnswers = [];
		/** @type {UnknownAnswer[]} */
		let unknownAnswers = [];
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
</script>

<div id="container">
	<div id="inner">
		{#each answersFiltered.knownAnswers as answer (answer.index)}
			<TextAnswerButton
				index={answer.index}
				answerText={answer.text}
				correct={answer.correct}
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
	}

	@container (width <= 40ch) {
		#inner {
			grid-template-columns: 1fr;
		}
	}
</style>
