<script lang="ts">
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import Answers from '$lib/game/Answers.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import Audio from '$lib/media/Audio.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
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

<Audio audioUrl={think} volumeOn={bindableGameInfo.volumeOn} />
<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
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
</HostLayout>

<style>
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
