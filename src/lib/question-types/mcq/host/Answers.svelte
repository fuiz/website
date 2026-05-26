<script lang="ts">
	import Answers from '$lib/game/Answers.svelte';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		timeLeft,
		timeStarted,
		answeredCount,
		media,
		onlock,
		onnext,
		onanswer
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		answers: (string | undefined)[];
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
		onanswer?: (answer: number) => void;
	} = $props();
</script>

<AnswersLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{timeLeft}
	{timeStarted}
	{answeredCount}
	{media}
	{onlock}
	{onnext}
>
	<div class="answers-large">
		<Answers
			{onanswer}
			answers={answers.map((a) => {
				if (a === undefined) return { text: '?', correct: undefined };
				return { text: a, correct: undefined };
			})}
		/>
	</div>
</AnswersLayout>

<style>
	.answers-large {
		font-size: 1.5em;
	}
</style>
