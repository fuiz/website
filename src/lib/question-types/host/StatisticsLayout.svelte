<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import BarChart from '~icons/material-symbols/bar-chart';
	import ImageOutline from '~icons/material-symbols/image-outline';
	import HostLayout from './HostLayout.svelte';
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

	let showMedia = $state(false);
</script>

<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
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
</HostLayout>

<style>
	.body {
		flex: 1;
		min-height: 0;
	}

	.media-area {
		height: 100%;
		position: relative;
	}
</style>
