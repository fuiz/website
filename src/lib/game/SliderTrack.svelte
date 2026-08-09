<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { SliderRange, SliderValueCount } from '$lib/types';
	import Check from '~icons/custom/check';
	import { formatSliderValue } from './sliderFormat';

	/**
	 * The slider, shared by the player (choosing a value) and the host (showing
	 * where everyone landed).
	 *
	 * It is one row of ticks rather than a rail with a chart stacked above it:
	 * the axis and the histogram are the same object, so a tick simply grows to
	 * however many people picked that value and shrinks to a dot when nobody
	 * did. That keeps the guesses legible against the scale they were made on.
	 */
	let {
		range,
		value = $bindable(undefined),
		unit = undefined,
		interactive = false,
		fill = false,
		distribution = [],
		correct = undefined,
		tolerance = 0,
		average = undefined,
		onchange
	}: {
		range: SliderRange;
		value?: number | undefined;
		unit?: string | undefined;
		interactive?: boolean;
		/** Let the ticks grow into a tall container, for the results screen. */
		fill?: boolean;
		distribution?: SliderValueCount[];
		/** The value that earned points, revealed on the results screen. */
		correct?: number | undefined;
		tolerance?: number;
		/** The room's mean guess, marked on the axis it was measured against. */
		average?: number | undefined;
		onchange?: (value: number) => void;
	} = $props();

	/**
	 * Ticks are capped so a 0-10000 range doesn't try to draw ten thousand of
	 * them; past the cap each tick stands for a bucket of values.
	 */
	const MAX_TICKS = 44;

	let span = $derived(Math.max(range.max - range.min, Number.EPSILON));

	let steps = $derived(range.step > 0 ? Math.floor(span / range.step) + 1 : Math.round(span) + 1);

	let tickCount = $derived(Math.max(2, Math.min(steps, MAX_TICKS)));

	/** The value a tick sits at. */
	function tickValue(index: number): number {
		return range.min + (index / (tickCount - 1)) * span;
	}

	/** The tick a value belongs to. */
	function tickIndex(at: number): number {
		const ratio = (at - range.min) / span;
		return Math.max(0, Math.min(tickCount - 1, Math.round(ratio * (tickCount - 1))));
	}

	/** Guesses folded onto the ticks that represent them. */
	let counts = $derived.by(() => {
		const buckets = new Array<number>(tickCount).fill(0);
		for (const entry of distribution) {
			buckets[tickIndex(entry.value)] += entry.count;
		}
		return buckets;
	});

	let maxCount = $derived(Math.max(...counts, 1));
	let hasResults = $derived(distribution.length > 0);

	let targetIndex = $derived(correct === undefined ? undefined : tickIndex(correct));

	/** Where the control actually sits, which is the midpoint until it is moved. */
	let midpoint = $derived((range.min + range.max) / 2);
	let effectiveValue = $derived(value ?? (interactive ? midpoint : undefined));
	let pickedIndex = $derived(effectiveValue === undefined ? undefined : tickIndex(effectiveValue));

	/** Ticks close enough to the correct value to score. */
	function withinMargin(index: number): boolean {
		if (correct === undefined || tolerance <= 0) return false;
		return Math.abs(tickValue(index) - correct) <= tolerance;
	}

	let format = $derived((at: number) => formatSliderValue(at, range, unit));

	// The bubble names the correct value once results are in, and whatever the
	// player is currently on before that.
	let bubbleIndex = $derived(targetIndex ?? pickedIndex);
	let bubbleValue = $derived(correct ?? effectiveValue);
	let showBubble = $derived(bubbleValue !== undefined && bubbleIndex !== undefined);
</script>

<div class="track" class:has-results={hasResults} class:fill>
	<div class="rail">
		<div class="ticks" style:--n={tickCount}>
			{#each { length: tickCount } as _, index (index)}
				<span
					class="tick"
					class:target={index === targetIndex}
					class:picked={correct === undefined && index === pickedIndex}
					class:in-margin={withinMargin(index)}
					class:empty={hasResults && counts[index] === 0}
					style:--h="{hasResults ? (counts[index] / maxCount) * 100 : 0}%"
					title={hasResults ? `${format(tickValue(index))} — ${counts[index]}` : undefined}
				>
					{#if showBubble && index === bubbleIndex && bubbleValue !== undefined}
						<!-- Rides its own tick rather than a row of its own, so it points at
						     the bar it names however tall that bar happens to be. -->
						<span class="bubble" class:correct={correct !== undefined}>
							{#if correct !== undefined}
								<Check height="0.85em" title={m.correct()} />
							{/if}
							{format(bubbleValue)}
						</span>
					{/if}
				</span>
			{/each}
		</div>

		{#if average !== undefined}
			<!-- A number on its own says nothing about a distribution; on the axis
			     it shows at a glance which way the room leaned of the answer. -->
			<span
				class="average"
				style:--x="{(tickIndex(average) / (tickCount - 1)) * 100}%"
				title="{m.average_guess()}: {format(average)}"
			></span>
		{/if}

		{#if interactive}
			<!-- The real control sits invisibly over the ticks, so dragging, the
			     keyboard and screen readers all keep working while the ticks do the
			     drawing. -->
			<input
				class="control"
				type="range"
				min={range.min}
				max={range.max}
				step={range.step}
				aria-label={m.slider_value()}
				value={effectiveValue ?? midpoint}
				oninput={(event) => {
					const next = Number(event.currentTarget.value);
					value = next;
					onchange?.(next);
				}}
			/>
		{/if}
	</div>

	{#if average !== undefined}
		<div class="average-row">
			<span
				class="bubble average-bubble"
				style:--x="{(tickIndex(average) / (tickCount - 1)) * 100}%"
			>
				<span class="bubble-value">{format(average)}</span>
				<span class="bubble-label">{m.average_guess()}</span>
			</span>
		</div>
	{/if}

	<div class="ends">
		<span>{format(range.min)}</span>
		<span>{format(range.max)}</span>
	</div>
</div>

<style>
	.track {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.bubble {
		position: absolute;
		left: 50%;
		bottom: calc(100% + 0.4em);
		translate: -50%;
		display: inline-flex;
		align-items: center;
		gap: 0.25em;
		padding: 0.3em 0.6em;
		border-radius: 0.45em;
		background: var(--primary);
		color: var(--on-primary);
		font-family: var(--alternative-font);
		font-weight: 800;
		white-space: nowrap;
	}

	.bubble.correct {
		background: var(--correct);
		color: var(--palette-light);
	}

	/* The tail that ties the label to its tick. */
	.bubble::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		translate: -50%;
		border-inline: 0.35em solid transparent;
		border-top: 0.38em solid var(--primary);
	}

	.bubble.correct::after {
		border-top-color: var(--correct);
	}

	.rail {
		position: relative;
	}

	/* Given a tall container the ticks take the slack, since the spread of guesses is
	   the content of the screen, so it should be what grows. */
	.track.fill {
		height: 100%;
	}

	.track.fill .rail {
		flex: 1;
		min-height: 0;
	}

	.track.fill .ticks {
		height: 100%;
	}

	.ticks {
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		align-items: end;
		height: 7em;
		/* Headroom the bubble sits in. Bars measure against what's left, so the
		   tallest can never grow up into its own label. */
		padding-top: 2.6em;
		box-sizing: border-box;
	}

	.tick {
		position: relative;
		justify-self: center;
		width: min(0.8em, 60%);
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 30%, transparent);
		/* Every tick keeps a floor so the scale stays readable where nobody
		   guessed; results grow from there. */
		height: max(1.5em, var(--h));
		transition: height 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* A value nobody picked drops back to a dot, so an unused step recedes
	   without leaving a hole in the scale. */
	.has-results .tick.empty {
		/* Fixed and square: a share of the column would stretch these into ovals. */
		width: 0.34em;
		height: 0.34em;
		background: color-mix(in srgb, var(--on-surface) 22%, transparent);
	}

	/* The margin that still scores, shown as a lighter run either side. */
	.tick.in-margin {
		background: color-mix(in srgb, var(--correct) 35%, transparent);
	}

	.tick.target {
		background: var(--correct);
		width: min(1.25em, 85%);
		/* Always the tallest thing on the row, whatever the counts do. */
		height: max(2.6em, var(--h));
	}

	.tick.picked {
		background: var(--primary);
		width: min(1.25em, 85%);
		height: max(2.6em, var(--h));
	}

	/* Dashed and neutral, so it never competes with the answer's solid mark. */
	.average {
		position: absolute;
		left: var(--x);
		top: 0;
		bottom: 0;
		width: 0;
		translate: -50%;
		border-left: 0.14em dashed color-mix(in srgb, var(--on-surface) 45%, transparent);
		pointer-events: none;
	}

	.control {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		appearance: none;
		background: transparent;
		cursor: pointer;
	}

	.control::-webkit-slider-thumb {
		appearance: none;
		width: 1.6em;
		height: 100%;
		background: transparent;
		cursor: grab;
	}

	.control::-moz-range-thumb {
		width: 1.6em;
		height: 100%;
		border: none;
		background: transparent;
		cursor: grab;
	}

	/* The input is invisible, so the focus ring has to go on what is drawn. */
	.rail:has(.control:focus-visible) .ticks {
		outline: 3px solid var(--secondary);
		outline-offset: 0.3em;
		border-radius: 0.3em;
	}

	/* Mirrors the answer's bubble, hanging under the axis instead of over it, and
	   outlined rather than filled so the answer stays the louder of the two. */
	.average-row {
		position: relative;
		height: 2.1em;
	}

	.average-bubble {
		position: absolute;
		left: var(--x);
		top: 0.45em;
		bottom: auto;
		translate: -50%;
		/* Solid grey rather than an outline: it should read as a second marker,
		   not as a disabled version of the answer. */
		background: color-mix(in srgb, var(--on-surface) 16%, var(--surface));
		color: var(--on-surface);
		border: none;
		flex-direction: column;
		gap: 0;
		line-height: 1.1;
		padding: 0.25em 0.6em;
	}

	.average-bubble::after {
		top: auto;
		bottom: 100%;
		border-top: none;
		border-bottom: 0.38em solid color-mix(in srgb, var(--on-surface) 16%, var(--surface));
	}

	.bubble-value {
		font-weight: 800;
	}

	/* Named, so a bare second number on the axis isn't left to be guessed at. */
	.bubble-label {
		font-size: 0.62em;
		font-weight: 700;
		opacity: 0.75;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.ends {
		display: flex;
		justify-content: space-between;
		font-family: var(--alternative-font);
		font-weight: 700;
		opacity: 0.7;
		font-size: 0.9em;
		margin-top: 0.3em;
	}
</style>
