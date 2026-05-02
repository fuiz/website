<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';

	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { BindableGameInfo, SharedGameInfo } from './+page';
	import Topbar from './Topbar.svelte';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		winners,
		lock,
		next
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		winners: string[];
		lock: () => void;
		next: () => void;
	} = $props();

	let fullscreenElement = $state<HTMLElement>();
</script>

<div bind:this={fullscreenElement} class="root">
	<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} onlock={lock} />
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				<TextBar onnext={next} text={m.winners()} showNext={true} heading={true} />
				<div class="winners">
					{#each winners as w (w)}
						<div class="winner">
							<div class="winner-name">{w}</div>
						</div>
					{/each}
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

	.winners {
		display: flex;
		flex-direction: column;
		max-width: 30ch;
		margin: auto;
		text-align: center;
		padding: 0.3em;
		gap: 0.3em;
	}

	.winner {
		background: var(--surface);
		border: 0.15em solid currentcolor;
		padding: 0.15em 0.4em;
		font-weight: bold;
		border-radius: 0.6em;
	}

	.winner-name {
		font-size: 1.5em;
	}
</style>
