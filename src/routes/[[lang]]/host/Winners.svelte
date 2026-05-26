<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';

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
</script>

<HostLayout bind:bindableGameInfo {gameInfo} onlock={lock}>
	<TextBar onnext={next} text={m.winners()} showNext={true} heading={true} />
	<div class="winners">
		{#each winners as w (w)}
			<div class="winner">
				<div class="winner-name">{w}</div>
			</div>
		{/each}
	</div>
</HostLayout>

<style>
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
