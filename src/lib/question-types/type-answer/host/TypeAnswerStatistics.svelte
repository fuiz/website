<script>
	import { buttonColors } from '$lib/clientOnly';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { toSorted } from '$lib/util';
	import Check from '~icons/custom/check';
	import Topbar from '../../../../routes/[[lang]]/host/Topbar.svelte';

	/** @type {{
	 * bindableGameInfo: import('../../../../routes/[[lang]]/host/+page').BindableGameInfo;
	 * gameInfo: import('../../../../routes/[[lang]]/host/+page').SharedGameInfo;
	 * questionText: string;
	 * answers: string[];
	 * caseSensitive: boolean;
	 * results: [string, number][];
	 * timeLeft?: number | undefined;
	 * timeStarted?: number | undefined;
	 * onlock?: (locked: boolean) => void;
	 * onnext?: () => void;
	}}*/
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		caseSensitive,
		results,
		timeLeft = undefined,
		timeStarted = undefined,
		onlock = undefined,
		onnext = undefined
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

	/**
	 * @param {string} answerA
	 * @param {string} answerB
	 * @param {boolean} caseSensitive
	 * @returns {boolean}
	 */
	function matches(answerA, answerB, caseSensitive) {
		const trimmedA = answerA.trim();
		const trimmedB = answerB.trim();
		return caseSensitive
			? trimmedA === trimmedB
			: trimmedA.toLowerCase() === trimmedB.toLowerCase();
	}

	let isCorrect = $derived(
		/**
		 * @param {string} text
		 * @return {boolean}
		 */
		(text) => answers.some((answer) => matches(answer, text, caseSensitive))
	);

	/** @type {HTMLElement | undefined} */
	let fullscreenElement = $state();
</script>

<div bind:this={fullscreenElement} class="root">
	<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} {onlock} />
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				<TextBar {onnext} text={questionText} showNext={true} />
				<div class="body">
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
											style:background={buttonColors[0][0]}
											style:border="0.15em solid {buttonColors[0][1]}"
											style:width="{(count / maxCount) * 100}%"
										>
											<span class="bar-count">{count}</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.root {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.background-area {
		flex: 1;
		min-height: 0;
	}

	.layout {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
		min-height: 0;
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
