<script lang="ts">
	import NiceBackground from '$lib/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/Game/TextBar.svelte';
	import type { BindableGameInfo, SharedGameInfo } from './+page';
	import { PUBLIC_CORKBOARD_URL } from '$env/static/public';
	import type { Media } from '$lib/types';
	import MediaContainer from '$lib/MediaContainer.svelte';

	interface Props {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		timeStarted: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	}

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		timeStarted,
		media,
		onlock,
		onnext
	}: Props = $props();

	let fullscreenElement: HTMLElement | undefined = $state();
</script>

<svelte:head>
	{#if media && 'Corkboard' in media.Image}
		<link
			rel="preload"
			as="image"
			href={PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id}
		/>
	{/if}
</svelte:head>

<div
	style:height="100%"
	bind:this={fullscreenElement}
	style:display="flex"
	style:flex-direction="column"
>
	<div style:border-bottom="0.15em solid currentcolor">
		<Topbar
			{onlock}
			{onnext}
			{fullscreenElement}
			bind:bindableGameInfo
			{gameInfo}
			showSkip={true}
		/>
	</div>
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:flex-direction="column"
				style:justify-content="center"
			>
				<TextBar text={questionText} topShadow={media === undefined} />
				<div id="progress" style:--duration="{timeStarted}ms">
					<div id="value"></div>
				</div>
				{#if media}
					<div style:flex="1" style:position="relative">
						<MediaContainer {media} fit="contain" />
					</div>
				{/if}
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	#progress {
		height: 0.15em;
	}

	#value {
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
