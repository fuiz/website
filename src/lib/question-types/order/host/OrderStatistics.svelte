<script lang="ts">
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Media } from '$lib/types';
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';
	import type { BindableGameInfo, SharedGameInfo } from '../../../../routes/[[lang]]/host/+page';
	import Topbar from '../../../../routes/[[lang]]/host/Topbar.svelte';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		axis_labels,
		answers,
		results,
		media: _media,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		axis_labels: { from: string; to: string };
		answers: string[];
		results: [number, number];
		media: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();

	let fullscreenElement = $state<HTMLElement>();
</script>

<div bind:this={fullscreenElement} class="root">
	<Topbar bind:bindableGameInfo {gameInfo} {onlock} {fullscreenElement} />
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				<TextBar text={questionText} showNext={true} {onnext} />
				<div class="body">
					<VerticalSplit>
						{#snippet top()}
							<div class="score-row">
								<div class="score">
									{results[0]}
									<Check height="1.25em" title={m.correct()} />
								</div>
								<div class="score">
									{results[1]}
									<Close height="1.25em" title={m.wrong()} />
								</div>
							</div>
						{/snippet}
						{#snippet bottom()}
							<div class="answer-area">
								{#if axis_labels.from}
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
								{#if axis_labels.to}
									<div class="axis-label">{axis_labels.to}</div>
								{/if}
							</div>
						{/snippet}
					</VerticalSplit>
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
	}

	.score-row {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2.5em;
		gap: 1em;
		padding: 0.2em;
	}

	.score {
		display: inline-flex;
		font-family: var(--alternative-font);
		align-items: center;
		gap: 0.2em;
	}

	.answer-area {
		display: flex;
		flex-direction: column;
		justify-content: center;
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
