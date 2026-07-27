<script lang="ts">
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
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
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		answers: string[];
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
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
	<div class="answers">
		{#each answers as answer, index (index)}
			<TextAnswerButton answerText={answer} {index} correct={undefined} />
		{/each}
	</div>
</AnswersLayout>

<style>
	.answers {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5em;
		padding: 0.6em;
		font-size: 1.4em;
	}

	@media (max-width: 700px) {
		.answers {
			grid-template-columns: 1fr;
			font-size: 1.1em;
		}
	}
</style>
