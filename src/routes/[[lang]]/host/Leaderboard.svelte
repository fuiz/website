<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import LeaderboardRecord from '$lib/game/LeaderboardRecord.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Topbar from './Topbar.svelte';

	/** @type {{
	 * bindableGameInfo: import('./+page').BindableGameInfo;
	 * gameInfo: import('./+page').SharedGameInfo;
	 * final: boolean;
	 * prior: import('./+page').TruncatedList<[string, number]>;
	 * current: import('./+page').TruncatedList<[string, number]>;
	 * onlock?: (locked: boolean) => void;
	 * onnext?: () => void;
	}} */
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		final,
		prior,
		current,
		onlock,
		onnext
	} = $props();

	// svelte-ignore state_referenced_locally
	let displayed = $state({
		exact_count: current.exact_count,
		items: prior.items
	});

	let displayed_final = $state(false);

	const duration = 3000,
		delay = 1000;

	onMount(() => {
		displayed = current;
		displayed_final = final;
	});

	/** @type {HTMLElement | undefined} */
	let fullscreenElement = $state();
</script>

<div
	bind:this={fullscreenElement}
	style:height="100%"
	style:display="flex"
	style:flex-direction="column"
>
	<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} {onlock} />
	<TextBar {onnext} text={m.scores()} showNext={true} heading={true} />
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:margin="auto"
				style:padding="10px"
				style:font-size="1.5em"
				style:max-width="30ch"
				style:display="flex"
				style:justify-content="center"
				style:gap="10px"
				style:flex-direction="column"
				style:box-sizing="border-box"
			>
				{#each displayed.items as [name, score], index (name)}
					<div animate:flip={{ duration, delay }} transition:fly={{ duration, delay, y: '200%' }}>
						<LeaderboardRecord {name} {score} {index} final={displayed_final} {duration} {delay} />
					</div>
				{/each}
				{#if displayed.exact_count > displayed.items.length}
					<div
						id="container"
						style:display="flex"
						style:align-items="center"
						style:gap="10px"
						style:color="white"
					>
						<div
							style:width="100%"
							style:background="var(--background-color)"
							style:border="0.15em solid"
							style:border-radius="0.6em"
							style:padding="0.15em 0.4em"
							style:box-sizing="border-box"
							style:display="flex"
							style:justify-content="center"
						>
							{m.more({
								count: displayed.exact_count - displayed.items.length
							})}
						</div>
					</div>
				{/if}
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	#container {
		font-size: 1em;
	}

	@media (max-width: 600px) {
		#container {
			font-size: 0.5em;
		}
	}
</style>
