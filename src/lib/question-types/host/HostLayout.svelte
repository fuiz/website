<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import type { BindableGameInfo, SharedGameInfo } from './types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		onlock,
		onnext,
		extraControls,
		children
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
		extraControls?: import('svelte').Snippet;
		children: import('svelte').Snippet;
	} = $props();

	let fullscreenElement = $state<HTMLElement>();
</script>

<div bind:this={fullscreenElement} class="root">
	<Topbar
		bind:bindableGameInfo
		{gameInfo}
		{fullscreenElement}
		{onlock}
		{onnext}
		{extraControls}
	/>
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				{@render children()}
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
</style>
