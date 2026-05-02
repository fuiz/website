<script>
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Audio from '$lib/media/Audio.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import Topbar from '../../../../routes/[[lang]]/host/Topbar.svelte';

	/** @type {{
	 * bindableGameInfo: import('../../../../routes/[[lang]]/host/+page').BindableGameInfo;
	 * gameInfo: import('../../../../routes/[[lang]]/host/+page').SharedGameInfo;
	 * questionText: string;
	 * axis_labels: { from: string; to: string };
	 * answers: string[];
	 * timeLeft: number | null;
	 * timeStarted: number | null;
	 * answeredCount: number;
	 * media: import('$lib/types').Media | undefined;
	 * onlock?: (locked: boolean) => void;
	 * onnext?: () => void;
	}} */
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
	} = $props();

	/** @type {HTMLElement | undefined} */
	let fullscreenElement = $state();
</script>

<Audio audioUrl={think} volumeOn={bindableGameInfo.volumeOn} />
<div bind:this={fullscreenElement} class="root">
	<Topbar bind:bindableGameInfo {gameInfo} {onlock} {onnext} {fullscreenElement} />
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				<div class="header">
					<div class="control">
						{#if timeLeft !== null && timeStarted !== null}
							<TimeLeft {timeLeft} {timeStarted} />
						{/if}
					</div>
					<div class="text-slot">
						<TextBar text={questionText} />
					</div>
					<div class="control">
						<AnsweredCount {answeredCount} />
					</div>
				</div>
				<div class="body">
					{#if media}
						<div class="media-area">
							<MediaContainer {media} showFallback={false} />
						</div>
					{/if}
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
		justify-content: flex-end;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 0 0.4em;
	}

	.text-slot {
		flex: 1;
		min-width: 0;
	}

	.control {
		z-index: 1;
	}

	.media-area {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

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
