<script>
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';

	/** @type {{
	 * players: [string, boolean][];
	 * selectable?: boolean;
	 * max?: undefined | number;
	 * exactCount: number;
	 * onchoose?: (players: string[]) => void;
	}}*/
	let {
		players = $bindable(),
		selectable = false,
		max = undefined,
		exactCount,
		onchoose
	} = $props();
</script>

{#each players as [player, selected], index (player)}
	<button
		class="player"
		style:color={selected ? 'var(--primary)' : 'inherit'}
		disabled={!selectable}
		style:cursor={selectable ? 'pointer' : 'normal'}
		onclick={() => {
			if (!selected && players.filter(([, s]) => s).length >= (max ?? players.length)) {
				return;
			}
			players[index][1] = !selected;
			onchoose?.(players.filter(([, sel]) => sel).map(([name]) => name));
		}}
		transition:scale={{ duration: 300, easing: backOut }}
	>
		{player}
	</button>
{/each}
{#if players.length < exactCount}
	<div class="player">
		{m.more({
			count: players.length - exactCount
		})}
	</div>
{/if}

<style>
	.player {
		background: var(--surface-variant);
		border: none;
		padding: 0.3em 0.6em;
		border-radius: 0.6em;
		font-family: inherit;
		font-size: inherit;
		font-weight: bold;
		word-break: break-word;
		color: inherit;
		transition: color 100ms linear;
	}
</style>
