<script lang="ts">
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		axis_labels,
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
		axis_labels: { from: string; to: string };
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
	<div class="answer-area">
		{#if axis_labels.from.length}
			<div class="axis-label">{axis_labels.from}</div>
		{/if}
		<div class="answer-row">
			<div class="arrow">
				<div class="arrow-body"></div>
				<div class="arrow-head"></div>
			</div>
			<div class="answer-list">
				{#each answers as answer, index (index)}
					<TextAnswerButton answerText={answer} {index} correct={undefined} />
				{/each}
			</div>
		</div>
		{#if axis_labels.to.length}
			<div class="axis-label">{axis_labels.to}</div>
		{/if}
	</div>
</AnswersLayout>

<style>
	.answer-area {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		padding: 1em;
	}

	.axis-label {
		font-size: 1.5em;
		font-family: var(--alternative-font);
		font-weight: 600;
	}

	.answer-row {
		display: flex;
		justify-content: space-between;
	}

	.arrow {
		display: flex;
		align-items: center;
		padding: 0 0.5em;
		flex-direction: column;
	}

	.arrow-body {
		width: 0.2em;
		height: 100%;
		background-color: currentColor;
		box-sizing: border-box;
	}

	.arrow-head {
		width: 0;
		height: 0;
		border-left: 0.6em solid transparent;
		border-right: 0.6em solid transparent;
		border-top: 0.6em solid currentColor;
	}

	.answer-list {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		flex: 1;
		font-size: 1.5em;
	}
</style>
