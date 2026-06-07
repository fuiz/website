<script lang="ts">
	import Answers from '$lib/game/Answers.svelte';
	import EmptyAnswers from '$lib/game/EmptyAnswers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { AnswerMode, Media, TextOrMedia } from '$lib/types';
	import MultiSelectAnswers from './MultiSelectAnswers.svelte';

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
</script>

<PlayerLayout {name} {score}>
	<div class="stack">
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
		{#if media && showAnswers}
			<div class="media">
				<MediaDisplay {media} fit="contain" />
			</div>
		{/if}
		{#if isMultiSelect}
			<MultiSelectAnswers {answers} {showAnswers} onsubmit={onarrayanswer} />
		{:else if !showAnswers}
			<EmptyAnswers indices={[...new Array(answers.length).keys()]} onanswer={onanswer} />
		{:else}
			<div class="answers">
				<Answers
					answers={answers.map((t) => ({ text: t?.Text, correct: undefined }))}
					onanswer={onanswer}
				/>
			</div>
		{/if}
	</div>
</PlayerLayout>

<style>
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
		font-size: 1.1em;
	}
</style>
