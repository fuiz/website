<script lang="ts">
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

	// An info slide asks nothing, so it drops the question header and answer grid
	// entirely and gives the whole screen to the content.
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		title,
		body,
		media,
		timeLeft,
		timeStarted,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		title: string;
		body: string | undefined;
		media: Media | undefined;
		timeLeft: number | null;
		timeStarted: number | null;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();
</script>

<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
	<div class="slide" class:with-media={media !== undefined}>
		{#if timeLeft !== null && timeStarted !== null}
			<div class="timer"><TimeLeft {timeLeft} {timeStarted} /></div>
		{/if}
		<div class="text">
			<h1>{title}</h1>
			{#if body}
				<p>{body}</p>
			{/if}
		</div>
		{#if media}
			<div class="media">
				<MediaContainer {media} fit="contain" showFallback={false} />
			</div>
		{/if}
	</div>
</HostLayout>

<style>
	.slide {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1em;
		padding: 1.5em clamp(1em, 6vw, 5em);
		box-sizing: border-box;
		text-align: center;
	}

	.timer {
		position: absolute;
		top: 0.5em;
		inset-inline-start: 0.5em;
	}

	.text {
		max-width: 40ch;
	}

	h1 {
		font-family: var(--alternative-font);
		font-size: clamp(1.8em, 5vw, 3.2em);
		line-height: 1.15;
		margin: 0 0 0.3em;
		/* A single long word at this size would otherwise run off the slide. */
		overflow-wrap: anywhere;
	}

	p {
		margin: 0;
		font-size: clamp(1em, 2.2vw, 1.5em);
		line-height: 1.5;
		opacity: 0.85;
		white-space: pre-wrap;
	}

	.media {
		position: relative;
		flex: 1;
		min-height: 0;
		width: 100%;
	}

	/* With an image the text takes the top slot and the picture fills the rest. */
	.slide.with-media {
		justify-content: flex-start;
	}
</style>
