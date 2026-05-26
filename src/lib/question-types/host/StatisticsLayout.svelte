<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import BarChart from '~icons/material-symbols/bar-chart';
	import ImageOutline from '~icons/material-symbols/image-outline';
	import Topbar from './Topbar.svelte';
	import type { BindableGameInfo, SharedGameInfo } from './types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		media,
		onnext,
		onlock,
		children
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		media?: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
		children: import('svelte').Snippet;
	} = $props();

	let fullscreenElement = $state<HTMLElement>();
	let showMedia = $state(false);
</script>

<div bind:this={fullscreenElement} class="root">
	<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} {onlock}>
		{#snippet extraControls()}
			{#if media}
				<StatedIconButton
					icons={[
						{ component: ImageOutline, alt: m.show_media() },
						{ component: BarChart, alt: m.show_statistics() }
					]}
					bind:state={showMedia}
				/>
			{/if}
		{/snippet}
	</Topbar>
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				<TextBar {onnext} text={questionText} showNext={true} />
				<div class="body">
					{#if showMedia && media}
						<div class="media-area">
							<MediaContainer {media} fit="contain" />
						</div>
					{:else}
						{@render children()}
					{/if}
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
	}

	.media-area {
		height: 100%;
		position: relative;
	}
</style>
