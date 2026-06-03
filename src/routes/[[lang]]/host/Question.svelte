<script lang="ts">
	import { env } from '$env/dynamic/public';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
	import QuestionHeader from '$lib/question-types/host/QuestionHeader.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

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

<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
	<div class="content">
		<QuestionHeader {questionText} {timeLeft} {timeStarted} {answeredCount} />
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
</HostLayout>

<style>
	.content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		/* Hold hidden while the slide announcement flies out, then enter — so the
		   question reveals with motion instead of appearing already-settled. */
		animation: question-reveal 0.45s cubic-bezier(0.2, 1.1, 0.3, 1) 0.56s backwards;
	}

	@keyframes question-reveal {
		from {
			opacity: 0;
			transform: translateY(0.6em) scale(0.97);
		}

		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.content {
			animation: none;
		}
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
