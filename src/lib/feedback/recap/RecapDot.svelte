<script lang="ts">
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';
	import BarChart from '~icons/material-symbols/bar-chart';
	import Remove from '~icons/material-symbols/remove';
	import type { RecapVerdict } from './context';

	/**
	 * One slide's verdict as a coloured mark: a dot in the strip, a tile in the
	 * end-of-game grid. The icon repeats what the colour says, tiles included,
	 * so no verdict rests on colour alone.
	 */
	let {
		verdict,
		label,
		number,
		selected = false,
		current = false,
		disabled = false,
		tabindex,
		onclick
	}: {
		verdict: RecapVerdict;
		/** What the mark stands for, read out in place of the icon. */
		label: string;
		/** Shown under the icon, for the numbered tiles. */
		number?: number;
		/** The slide open beside the mark. */
		selected?: boolean;
		/** The slide being played, drawn hollow until it is over. */
		current?: boolean;
		/** Marked unavailable, while the player owes an answer. */
		disabled?: boolean;
		/** -1 to leave the dot out of the Tab order, for a group the arrow keys step through. */
		tabindex?: number;
		onclick?: () => void;
	} = $props();
</script>

{#snippet face()}
	{#if !current}
		{#if verdict === 'Correct' || verdict === 'Partial'}
			<Check />
		{:else if verdict === 'Incorrect'}
			<Close />
		{:else if verdict === 'Unanswered'}
			<Remove />
		{:else}
			<BarChart />
		{/if}
	{/if}
	{#if number !== undefined}
		<span class="number">{number}</span>
	{/if}
{/snippet}

{#if onclick}
	<button
		type="button"
		class={['dot', verdict.toLowerCase(), { selected, current, tile: number !== undefined }]}
		aria-label={label}
		aria-pressed={selected}
		aria-disabled={disabled}
		{tabindex}
		{onclick}
	>
		{@render face()}
	</button>
{:else}
	<span
		class={['dot', verdict.toLowerCase(), { selected, current, tile: number !== undefined }]}
		role="img"
		aria-label={label}
	>
		{@render face()}
	</span>
{/if}

<style>
	.dot {
		--dot-ring: var(--on-surface);
		position: relative;
		flex: none;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: var(--dot-size, 1.3em);
		height: var(--dot-height, var(--dot-size, 1.3em));
		border-radius: var(--dot-radius, 50%);
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: #fff;
		background: var(--dot-bg);
	}

	.dot :global(svg) {
		width: 70%;
		height: 70%;
	}

	.tile :global(svg) {
		width: 1em;
		height: 1em;
	}

	button.dot {
		cursor: pointer;
	}

	/* The dot is small to keep the strip one line; the hit area is not. */
	button.dot::after {
		content: '';
		position: absolute;
		inset: calc(-1 * var(--dot-reach, 0.35em));
	}

	button.dot[aria-disabled='true'] {
		cursor: not-allowed;
	}

	button.dot:focus-visible {
		outline: 2px solid var(--dot-ring);
		outline-offset: 2px;
	}

	.correct {
		--dot-bg: var(--correct);
	}

	/* Earned something, so it stays on the correct side, but paler than a full hit. */
	.partial {
		--dot-bg: color-mix(in srgb, var(--correct) 55%, var(--surface));
		color: var(--on-surface);
	}

	.incorrect {
		--dot-bg: var(--incorrect);
	}

	/* Grey on the pale pill all but vanishes; the outline gives the dot its
	   shape back. */
	.unanswered,
	.recorded {
		--dot-bg: var(--surface-container-high);
		color: var(--on-surface-variant);
		box-shadow: inset 0 0 0 1.5px var(--on-surface-variant);
	}

	.selected {
		outline: 2px solid var(--dot-ring);
		outline-offset: 2px;
	}

	/* Hollow, so the slide still in play never reads as one to tap or as chosen. */
	.current {
		background: transparent;
		border: 2px dashed var(--on-surface-variant);
	}

	.number {
		font-family: var(--alternative-font);
		font-weight: 700;
		font-size: 0.8em;
		line-height: 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		.current {
			animation: arrive 400ms ease-out;
		}
	}

	@keyframes arrive {
		from {
			transform: scale(0.3);
			opacity: 0;
		}
	}
</style>
