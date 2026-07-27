<script lang="ts">
	import { paletteClass } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import Check from '~icons/custom/check';

	export type ResultBar = {
		/** What the bar is labelled with. */
		label: string;
		count: number;
		/** Marks the bar as the right answer; `undefined` means "not scored". */
		correct?: boolean | undefined;
		/** Overrides the palette slot, so bars can match their answer buttons. */
		palette?: number;
	};

	/**
	 * A labelled horizontal bar chart, shared by every results screen that boils
	 * down to "how many people picked each of these".
	 *
	 * Bars are sized against the busiest one rather than the player count, so a
	 * lopsided split still reads clearly.
	 */
	let {
		bars,
		/** Shown as a percentage under each count when a total is given. */
		total = undefined,
		emptyMessage = undefined
	}: {
		bars: ResultBar[];
		total?: number | undefined;
		emptyMessage?: string | undefined;
	} = $props();

	let maxCount = $derived(Math.max(...bars.map((bar) => bar.count), 1));

	function percentage(count: number): string | undefined {
		if (!total) return undefined;
		return `${Math.round((count / total) * 100)}%`;
	}
</script>

{#if bars.length === 0}
	<div class="empty">{emptyMessage ?? m.no_responses()}</div>
{:else}
	<div class="grid">
		{#each bars as bar, index (index)}
			<div class="label" class:faded={bar.correct === false}>
				{#if bar.correct === true}
					<Check height="0.9em" title={m.correct()} />
				{/if}
				<span class="label-text">{bar.label}</span>
			</div>
			<div class={['bar-row', paletteClass(bar.palette ?? index)]} class:faded={bar.correct === false}>
				<div class="bar" style:--width="{(bar.count / maxCount) * 100}%">
					<span class="count">{bar.count}</span>
				</div>
				{#if percentage(bar.count)}
					<span class="pct">{percentage(bar.count)}</span>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(4ch, auto) 1fr;
		align-items: center;
		gap: 0.4em 0.6em;
		width: min(46em, 92%);
		margin: 0 auto;
		padding: 0.5em 0;
		font-size: 1.35em;
	}

	.label {
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.3em;
		text-align: end;
		font-family: var(--alternative-font);
		min-width: 0;
	}

	.label-text {
		overflow-wrap: anywhere;
	}

	.label.faded,
	.bar-row.faded {
		opacity: 0.5;
	}

	.bar-row {
		display: flex;
		align-items: center;
		gap: 0.5em;
		height: 1.7em;
		min-width: 0;
	}

	.bar {
		height: 100%;
		/* Keep the count legible even when nobody picked this one. */
		min-width: 1.8em;
		width: var(--width);
		border-radius: 0.4em;
		background: var(--btn-bg);
		border: 0.14em solid var(--btn-deep);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0 0.4em;
		color: #ffffff;
		transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.count {
		font-family: var(--alternative-font);
		font-weight: bold;
	}

	.pct {
		font-size: 0.75em;
		opacity: 0.7;
		font-family: var(--alternative-font);
		flex: none;
	}

	.empty {
		text-align: center;
		opacity: 0.6;
		font-size: 1.4em;
		padding: 1em;
	}

	@media (max-width: 600px) {
		.grid {
			font-size: 1.05em;
			width: 96%;
		}
	}
</style>
