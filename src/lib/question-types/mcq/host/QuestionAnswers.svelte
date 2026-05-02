<script>
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import Answers from '$lib/game/Answers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Audio from '$lib/media/Audio.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import Topbar from '../../../../routes/[[lang]]/host/Topbar.svelte';

	/** @type {{bindableGameInfo: import('../../../../routes/[[lang]]/host/+page').BindableGameInfo, gameInfo: import('../../../../routes/[[lang]]/host/+page').SharedGameInfo, questionText: string, answers: (string | undefined)[], timeLeft: number | null, timeStarted: number | null, answeredCount: number, media: import('$lib/types').Media | undefined, onlock?: (locked: boolean) => void, onnext?: () => void, onanswer?: (answer: number) => void}}*/
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
					<div class="answers-large">
						<Answers
							{onanswer}
							answers={answers.map((a) => {
								if (a === undefined) return { text: '?', correct: undefined };
								return { text: a, correct: undefined };
							})}
						/>
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

	.answers-large {
		font-size: 1.5em;
	}
</style>
