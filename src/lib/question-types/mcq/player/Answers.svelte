<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Answers from '$lib/game/Answers.svelte';
	import EmptyAnswers from '$lib/game/EmptyAnswers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { AnswerMode, Media, TextOrMedia } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Topbar from '../../../../routes/[[lang]]/play/Topbar.svelte';

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
	}: {
		questionText: string;
		name: string;
		score: number;
		media: undefined | Media;
		showAnswers: boolean;
		answers: (TextOrMedia | undefined)[];
		answerMode?: AnswerMode;
		onanswer?: (answer: number) => void;
		onarrayanswer?: (answers: number[]) => void;
	} = $props();

	let isMultiSelect = $derived(answerMode === 'MultipleAnswers');

	let selectedIndices = new SvelteSet<number>();

	function toggleIndex(index: number) {
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

	function handleAnswer(index: number) {
		if (isMultiSelect) {
			toggleIndex(index);
		} else {
			if (onanswer) onanswer(index);
		}
	}
</script>

<div class="page">
	<div>
		<Topbar {name} {score} />
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	</div>
	<div class="body">
		<NiceBackground>
			<div class="stack">
				{#if media && showAnswers}
					<div class="media">
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
					<div class="answers">
						<Answers
							answers={answers.map((t) => ({ text: t?.Text, correct: undefined }))}
							selected={isMultiSelect ? selectedIndices : undefined}
							onanswer={handleAnswer}
						/>
					</div>
				{/if}
				{#if isMultiSelect}
					<div class="submit-row">
						<FancyButton onclick={submitMultiAnswer} disabled={selectedIndices.size === 0}>
							<div class="submit-label">{m.submit()}</div>
						</FancyButton>
					</div>
				{/if}
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
		min-height: 0;
	}

	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.media {
		height: 40dvh;
		flex: none;
	}

	.answers {
		flex: 1;
		min-height: 0;
		font-size: 1.5em;
	}

	.submit-row {
		padding: 0.2em;
	}

	.submit-label {
		padding: 0.2em 0.5em;
	}
</style>
