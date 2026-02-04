<script>
	import * as m from '$lib/paraglide/messages.js';

	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

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
		style:background="var(--background-color)"
		style:border="0.15em solid currentColor"
		style:padding="0.15em 0.4em"
		style:border-radius="0.6em"
		style:font-family="inherit"
		style:font-size="inherit"
		style:color={selected ? 'var(--accent-color)' : 'inherit'}
		style:font-weight="bold"
		style:transition="color 100ms linear"
		style:word-break="break-word"
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
	<div
		style:background="var(--background-color)"
		style:padding="0.5em 0.4em"
		style:border="0.15em solid currentcolor"
		style:border-radius="0.6em"
		style:font-weight="bold"
		style:word-break="break-word"
	>
		{m.more({
			count: players.length - exactCount
		})}
	</div>
{/if}
