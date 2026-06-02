<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import LeaderboardRecord from '$lib/game/LeaderboardRecord.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
	import type {
		BindableGameInfo,
		SharedGameInfo,
		TruncatedList
	} from '$lib/question-types/host/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		final,
		prior,
		current,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		final: boolean;
		prior: TruncatedList<[string, number]>;
		current: TruncatedList<[string, number]>;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let displayed = $state({
		exact_count: current.exact_count,
		items: prior.items
	});

	let displayed_final = $state(false);

	const duration = 3000,
		delay = 1000;

	onMount(async () => {
		await new Promise((r) => requestAnimationFrame(r));
		displayed = current;
		await new Promise((r) => requestAnimationFrame(r));
		displayed_final = final;
	});
</script>

<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
	<TextBar {onnext} text={m.scores()} showNext={true} heading={true} />
	<div class="entries">
		{#each displayed.items as [name, score], index (name)}
			<div animate:flip={{ duration, delay }} transition:fly={{ duration, delay, y: '200%' }}>
				<LeaderboardRecord {name} {score} {index} final={displayed_final} {duration} {delay} />
			</div>
		{/each}
		{#if displayed.exact_count > displayed.items.length}
			<div class="more">
				{m.more({
					count: displayed.exact_count - displayed.items.length
				})}
			</div>
		{/if}
	</div>
</HostLayout>

<style>
	.entries {
		flex: 1;
		width: 100%;
		max-width: 60ch;
		margin: 0 auto;
		padding: 1em;
		font-size: min(2em, 5vw);
		display: flex;
		justify-content: center;
		gap: 0.4em;
		flex-direction: column;
		box-sizing: border-box;
	}

	.more {
		background: var(--surface-variant);
		padding: 0.4em 0.8em;
		font-weight: bold;
		border-radius: 0.6em;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
	}
</style>
