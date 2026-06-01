<script lang="ts">
	import { buttonColors } from '$lib/clientOnly';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';
	import { toSorted } from '$lib/util';
	import Check from '~icons/custom/check';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		caseSensitive,
		results,
		timeLeft = undefined,
		timeStarted = undefined,
		media = undefined,
		onlock = undefined,
		onnext = undefined
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		answers: string[];
		caseSensitive: boolean;
		results: [string, number][];
		timeLeft?: number;
		timeStarted?: number;
		media?: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();

	let allAnswers = $derived(
		toSorted(
			results.concat(
				answers
					.filter(
						(possibleAnswer) =>
							!results.some(([correctAnswerText]) => correctAnswerText === possibleAnswer)
					)
					.map((wrongAnswer) => [wrongAnswer, 0])
			),
			([, frequencyA], [, frequencyB]) => frequencyB - frequencyA
		)
	);

	let maxCount = $derived(Math.max(...allAnswers.map(([, count]) => count), 1));

	function matches(answerA: string, answerB: string, caseSensitive: boolean): boolean {
		const trimmedA = answerA.trim();
		const trimmedB = answerB.trim();
		return caseSensitive
			? trimmedA === trimmedB
			: trimmedA.toLowerCase() === trimmedB.toLowerCase();
	}

	let isCorrect = $derived((text: string): boolean =>
		answers.some((answer) => matches(answer, text, caseSensitive))
	);
</script>

<StatisticsLayout bind:bindableGameInfo {gameInfo} {questionText} {media} {onnext} {onlock}>
	<div class="content">
		{#if timeLeft !== undefined && timeStarted !== undefined}
			<TimeLeft {timeLeft} {timeStarted} />
		{/if}
		<div class="answers-center">
			<div class="answers-grid">
				{#each allAnswers as [text, count] (text)}
					{@const correct = isCorrect(text)}
					<div class="label" class:faded={!correct}>
						{#if correct}
							<Check height="1em" title={m.correct()} />
						{/if}
						{text}
					</div>
					<div class="bar-row" class:faded={!correct}>
						<div class="track">
							<div
								class="bar"
								style:--bar-bg={buttonColors[0][0]}
								style:--bar-border={buttonColors[0][1]}
								style:--width="{(count / maxCount) * 100}%"
							>
								<span class="bar-count">{count}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</StatisticsLayout>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.answers-center {
		display: flex;
		justify-content: center;
	}

	.answers-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		padding: 0.5em;
		align-items: center;
		gap: 0.5em;
		font-size: 1.6em;
		width: min(40em, 90vw);
	}

	.label {
		text-align: end;
		font-family: var(--alternative-font);
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		justify-content: flex-end;
	}

	.label.faded {
		opacity: 0.5;
	}

	.bar-row {
		display: flex;
		align-items: center;
		height: 1.8em;
	}

	.bar-row.faded {
		opacity: 0.5;
	}

	.track {
		flex: 1;
		height: 100%;
		min-width: 0;
	}

	.bar {
		border-radius: 0.4em;
		height: 100%;
		min-width: 1.6em;
		width: var(--width);
		background: var(--bar-bg);
		border: 0.15em solid var(--bar-border);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0 0.4em;
		box-sizing: border-box;
		color: var(--palette-light);
	}

	.bar-count {
		font-family: var(--alternative-font);
		font-weight: bold;
	}
</style>
