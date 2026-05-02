<script lang="ts">
	import { env } from '$env/dynamic/public';
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';
	import type { BindableGameInfo, SharedGameInfo } from './+page';
	import Topbar from './Topbar.svelte';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		timeLeft = null,
		timeStarted,
		answeredCount = undefined,
		media,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		timeLeft?: number | null;
		timeStarted: number | null;
		answeredCount?: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();

	let fullscreenElement = $state<HTMLElement>();
</script>

<svelte:head>
	{#if media && 'Corkboard' in media.Image}
		<link
			rel="preload"
			as="image"
			href={env.PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id}
		/>
	{/if}
</svelte:head>

<div bind:this={fullscreenElement} class="root">
	<Topbar {onlock} {onnext} {fullscreenElement} bind:bindableGameInfo {gameInfo} />
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
						{#if answeredCount !== undefined}
							<AnsweredCount {answeredCount} />
						{/if}
					</div>
				</div>
				{#if timeStarted !== null && timeLeft === null}
					<div class="progress" style:--duration="{timeStarted}ms">
						<div class="progress-value"></div>
					</div>
				{/if}
				{#if media}
					<div class="media">
						<MediaContainer {media} fit="contain" />
					</div>
				{/if}
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
		justify-content: center;
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

	.media {
		flex: 1;
		position: relative;
	}

	.progress {
		height: 0.15em;
	}

	.progress-value {
		height: 100%;
		background: currentColor;
		animation: timer var(--duration) linear;
	}

	@keyframes timer {
		from {
			width: 0%;
		}

		to {
			width: 100%;
		}
	}
</style>
