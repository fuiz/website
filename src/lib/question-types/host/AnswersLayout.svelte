<script lang="ts">
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import Audio from '$lib/media/Audio.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';
	import HostLayout from './HostLayout.svelte';
	import QuestionHeader from './QuestionHeader.svelte';
	import type { BindableGameInfo, SharedGameInfo } from './types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		timeLeft,
		timeStarted,
		answeredCount,
		media,
		onlock,
		onnext,
		children
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
		children: import('svelte').Snippet;
	} = $props();
</script>

<Audio audioUrl={think} volumeOn={bindableGameInfo.volumeOn} />
<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
	<QuestionHeader {questionText} {timeLeft} {timeStarted} {answeredCount} />
	<div class="body">
		{#if media}
			<div class="media-area">
				<MediaContainer {media} showFallback={false} />
			</div>
		{/if}
		{@render children()}
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

	.media-area {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
</style>
