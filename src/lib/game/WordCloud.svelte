<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import type { FreeTextEntry } from '$lib/types';

	/**
	 * The collected words, sized by how often they were said.
	 *
	 * Laid out as centred flowing text rather than a packed cloud: it reflows
	 * cleanly at any width, stays readable on a projector, and never overlaps.
	 */
	let {
		entries,
		/** Beyond this the tail is summarised rather than rendered. */
		limit = 60
	}: {
		entries: FreeTextEntry[];
		limit?: number;
	} = $props();

	let shown = $derived(entries.slice(0, limit));
	let hidden = $derived(Math.max(0, entries.length - shown.length));

	let maxCount = $derived(Math.max(...entries.map((entry) => entry.count), 1));
	let minCount = $derived(Math.min(...entries.map((entry) => entry.count), 1));

	/**
	 * Maps a frequency onto a font size. The range is deliberately gentle, since a
	 * word said twice as often should look bigger, not ten times bigger.
	 */
	function scale(count: number): number {
		if (maxCount === minCount) return 1.8;
		return 1 + ((count - minCount) / (maxCount - minCount)) * 2.2;
	}
</script>

{#if entries.length === 0}
	<div class="empty">{m.no_responses()}</div>
{:else}
	<div class="cloud">
		{#each shown as entry, index (entry.text)}
			<span
				class={['word', paletteClass(index)]}
				style:--size="{scale(entry.count)}em"
				title="{entry.text} — {entry.count}"
			>
				{entry.text}
				{#if entry.count > 1}
					<span class="count">×{entry.count}</span>
				{/if}
			</span>
		{/each}
	</div>
	{#if hidden > 0}
		<div class="more">{m.and_more({ count: hidden })}</div>
	{/if}
{/if}

<style>
	.cloud {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		align-content: center;
		gap: 0.25em 0.6em;
		padding: 0.6em 1em;
		height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.word {
		font-size: var(--size);
		font-family: var(--alternative-font);
		font-weight: 800;
		line-height: 1.15;
		color: var(--btn-bg);
		overflow-wrap: anywhere;
		animation: pop 400ms cubic-bezier(0.2, 1.4, 0.3, 1) both;
	}

	.count {
		font-size: 0.45em;
		font-weight: 700;
		opacity: 0.7;
		vertical-align: super;
	}

	.more {
		text-align: center;
		font-size: 0.9em;
		opacity: 0.6;
		padding-bottom: 0.5em;
	}

	.empty {
		display: grid;
		place-items: center;
		height: 100%;
		opacity: 0.6;
		font-size: 1.5em;
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.85);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.word {
			animation: none;
		}
	}
</style>
