<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import type { BindableGameInfo, ResponseSummary, SharedGameInfo } from './types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		onlock,
		onnext,
		responses = undefined,
		extraControls,
		children
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
		responses?: ResponseSummary;
		extraControls?: import('svelte').Snippet;
		children: import('svelte').Snippet;
	} = $props();

	let fullscreenElement = $state<HTMLElement>();
</script>

<div bind:this={fullscreenElement} class="root">
	<!-- The background sits behind the top bar too, so it shows around the floating pill. -->
	<NiceBackground>
		<div class="column">
			<Topbar
				bind:bindableGameInfo
				{gameInfo}
				{fullscreenElement}
				{onlock}
				{onnext}
				{responses}
				{extraControls}
			/>
			<div class="layout">
				{@render children()}
			</div>
		</div>
	</NiceBackground>
</div>

<style>
	.root {
		height: 100%;
	}

	.column {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.layout {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>
