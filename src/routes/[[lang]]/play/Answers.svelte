<script>
	import { SvelteSet } from 'svelte/reactivity';
	import Answers from '$lib/game/Answers.svelte';
	import EmptyAnswers from '$lib/game/EmptyAnswers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Topbar from './Topbar.svelte';

	/** @type {{questionText: string;name: string;score: number;media: undefined | import('$lib/types').Media;showAnswers: boolean;answers: (import('$lib/types').TextOrMedia | undefined)[];answerMode?: import('$lib/types').AnswerMode;onanswer?: (answer: number) => void;onarrayanswer?: (answers: number[]) => void;}} */
	let {
		questionText,
		name,
		score,
		media,
		showAnswers,
		answers,
		answerMode,
		onanswer,
		onarrayanswer
	} = $props();

	let isMultiSelect = $derived(answerMode === 'MultipleAnswers');

	let selectedIndices = new SvelteSet();

	/**
	 * @param {number} index
	 */
	function toggleIndex(index) {
		if (selectedIndices.has(index)) {
			selectedIndices.delete(index);
		} else {
			selectedIndices.add(index);
		}
	}

	function submitMultiAnswer() {
		if (onarrayanswer && selectedIndices.size > 0) {
			onarrayanswer([...selectedIndices]);
		}
	}

	/**
	 * @param {number} index
	 */
	function handleAnswer(index) {
		if (isMultiSelect) {
			toggleIndex(index);
		} else {
			if (onanswer) onanswer(index);
		}
	}
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<div>
		<Topbar {name} {score} />
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	</div>
	<div style:flex="1">
		<NiceBackground>
			<div style:height="100%" style:display="flex" style:flex-direction="column">
				{#if media && showAnswers}
					<div style:height="40dvh">
						<MediaDisplay {media} fit="contain" />
					</div>
				{/if}
				{#if !showAnswers}
					<EmptyAnswers
						indices={[...new Array(answers.length).keys()]}
						selected={isMultiSelect ? selectedIndices : undefined}
						onanswer={handleAnswer}
					/>
				{:else}
					<div style:flex="1" style:font-size="1.5em">
						<Answers
							answers={answers.map((t) => ({ text: t?.Text, correct: undefined }))}
							selected={isMultiSelect ? selectedIndices : undefined}
							onanswer={handleAnswer}
						/>
					</div>
				{/if}
				{#if isMultiSelect}
					<div style:padding="0.2em">
						<FancyButton onclick={submitMultiAnswer} disabled={selectedIndices.size === 0}>
							<div style:padding="0.2em 0.5em">{m.submit()}</div>
						</FancyButton>
					</div>
				{/if}
			</div>
		</NiceBackground>
	</div>
</div>
