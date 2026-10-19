<script lang="ts">
	import Answers from '$lib/game/Answers.svelte';
	import EmptyAnswers from '$lib/game/EmptyAnswers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
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
	<div class="stack" class:has-media={media && showAnswers}>
		{#if showAnswers}
			<TextBar text={questionText} fit />
		{/if}
		{#if media && showAnswers}
			<div class="media">
				<ZoomableImage {media} hug />
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
					fill
					onanswer={onanswer}
				/>
			</div>
		{/if}
	</div>
</PlayerLayout>

<style>
	/* Scrolls only when the question, the image and the answers can't all fit at their
	   minimum sizes, as on a short phone with a long question. */
	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		/* The question shrinks to fit a share of this; see TextBar's fit. */
		container-type: size;
	}

	.stack.has-media {
		--text-bar-height: 22cqh;
	}

	/* As tall as the image is at full width (so a wide image leaves no empty bands),
	   between 20dvh and 40dvh. It gives up height before the answers drop below their
	   minimum row size; tapping it opens the full-size viewer. */
	.media {
		flex: 0 1 auto;
		min-height: 20dvh;
		max-height: 40dvh;
	}

	.answers {
		flex: 1;
		font-size: 1.1em;
	}
</style>
