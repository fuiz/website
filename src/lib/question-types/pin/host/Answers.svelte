<script lang="ts">
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import PinBoard from '$lib/game/PinBoard.svelte';
	import Audio from '$lib/media/Audio.svelte';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
	import QuestionHeader from '$lib/question-types/host/QuestionHeader.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

	// Unlike other types the image *is* the answer surface, so this doesn't use
	// AnswersLayout: the board needs the whole body, not a media strip above it.
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		media,
		timeLeft,
		timeStarted,
		answeredCount,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		media: Media | undefined;
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();
</script>

<Audio audioUrl={think} volumeOn={bindableGameInfo.volumeOn} />
<HostLayout
	bind:bindableGameInfo
	{gameInfo}
	{onlock}
	{onnext}
	responses={{ count: answeredCount }}
>
	<QuestionHeader {questionText} {timeLeft} {timeStarted} />
	<div class="board">
		<PinBoard {media} />
	</div>
</HostLayout>

<style>
	.board {
		flex: 1;
		min-height: 0;
		padding: 0.5em;
		box-sizing: border-box;
	}
</style>
