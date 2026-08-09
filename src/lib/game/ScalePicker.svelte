<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { ScaleLabels, ScaleStyle } from '$lib/types';

	/**
	 * The row of numbered buttons an agreement or NPS scale is answered on,
	 * shared by the player (picking) and the host (showing the spread).
	 *
	 * When `counts` is supplied each button grows a column above it, so results
	 * land on exactly the control players just used.
	 */
	let {
		points,
		labels,
		style = 'Agreement',
		fill = false,
		selected = undefined,
		counts = undefined,
		total = undefined,
		interactive = false,
		onpick
	}: {
		points: number[];
		labels: ScaleLabels;
		/** NPS splits its range into named bands; an agreement scale does not. */
		style?: ScaleStyle;
		/** Let the columns grow into a tall container, for the results screen. */
		fill?: boolean;
		selected?: number | undefined;
		/** One count per point, aligned with `points`. */
		counts?: number[] | undefined;
		/** Responses in total, so counts can be shown as shares of the room. */
		total?: number | undefined;
		interactive?: boolean;
		onpick?: (value: number) => void;
	} = $props();

	let maxCount = $derived(Math.max(...(counts ?? [0]), 1));

	// NPS runs 0..10, which is too many buttons to keep on one line on a phone;
	// a 1..5 scale always fits.
	let dense = $derived(points.length > 7);

	/**
	 * The three bands a Net Promoter Score is read in.
	 *
	 * Deliberately not the conventional red/amber/green: this codebase avoids
	 * red-green pairs (see `--correct`), so the ramp runs red to orange to teal,
	 * which orders the same way without asking anyone to tell red from green.
	 */
	const NPS_BANDS = [
		{ label: m.detractors, palette: 0, upTo: 6 },
		{ label: m.passives, palette: 3, upTo: 8 },
		{ label: m.promoters, palette: 5, upTo: 10 }
	];

	function bandFor(value: number) {
		if (style !== 'Nps') return undefined;
		return NPS_BANDS.find((band) => value <= band.upTo) ?? NPS_BANDS[NPS_BANDS.length - 1];
	}

	/** Each band paired with how many points it covers, for the legend below. */
	let bandSpans = $derived.by(() => {
		if (style !== 'Nps') return [];
		return NPS_BANDS.map((band) => ({
			...band,
			span: points.filter((point) => bandFor(point) === band).length
		})).filter((band) => band.span > 0);
	});

	/** A point's palette: its band on NPS, otherwise one colour throughout. */
	function paletteOf(value: number): number {
		return bandFor(value)?.palette ?? 0;
	}

	/** Counts read better as shares of the room than as raw tallies. */
	function tally(count: number): string {
		if (total === undefined || total <= 0) return String(count);
		return `${Math.round((count / total) * 100)}%`;
	}
</script>

<!-- The column count is driven by the data rather than `auto-fit`, which with a
     zero minimum happily invents empty tracks. When counts are shown the bars
     have to stay directly above their numbers, so that layout never wraps. -->
<div
	class="scale"
	class:dense
	class:fill
	class:has-counts={counts !== undefined}
	style:--n={points.length}
>
	<div class="row">
		{#if labels.low}
			<span class="end">{labels.low}</span>
		{/if}

		<div class="chart">
			{#if counts}
				<div class="columns">
					{#each points as point, index (point)}
						{@const count = counts[index] ?? 0}
						<div class={['column', `palette-${paletteOf(point)}`]}>
							<span class="column-bar" style:--h="{(count / maxCount) * 100}%"></span>
							<span class="tally">{tally(count)}</span>
						</div>
					{/each}
				</div>
			{/if}

			<div class="points">
				{#each points as point, index (point)}
					{@const voted = (counts?.[index] ?? 0) > 0}
					{#if interactive}
						<button
							type="button"
							class={['point', `palette-${paletteOf(point)}`]}
							class:selected={selected === point}
							aria-pressed={selected === point}
							onclick={() => onpick?.(point)}
						>
							{point}
						</button>
					{:else}
						<div
							class={['point', `palette-${paletteOf(point)}`]}
							class:selected={selected === point}
							class:voted
						>
							{point}
						</div>
					{/if}
				{/each}
			</div>

			{#if bandSpans.length > 0 && counts}
				<!-- Which stretch of the scale each band covers, so the score above
				     can be read off the row it came from. -->
				<div class="bands">
					{#each bandSpans as band (band.palette)}
						<span class={['band', `palette-${band.palette}`]} style:--span={band.span}>
							{band.label()}
						</span>
					{/each}
				</div>
			{/if}
		</div>

		{#if labels.high}
			<span class="end end-high">{labels.high}</span>
		{/if}
	</div>

	{#if labels.mid}
		<div class="mid">{labels.mid}</div>
	{/if}
</div>

<style>
	.scale {
		--chip: 3.2em;
		width: 100%;
		/* The layout answers to the room it is given, not to the device: the
		   player's card is narrow on a wide screen, where a viewport query would
		   keep the end labels inline and squeeze the numbers down to dots. */
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 0.35em;
	}

	/* Given a tall container the columns take the slack: the distribution is the
	   point of the screen, so it should be the thing that grows. */
	.scale.fill {
		height: 100%;
	}

	.scale.fill .row {
		flex: 1;
		min-height: 0;
		align-items: stretch;
	}

	.scale.fill .end {
		align-self: end;
	}

	.scale.fill .columns {
		height: auto;
		flex: 1;
		min-height: 3em;
	}

	/* The end labels sit beside the scale rather than beneath it: they name the
	   two extremes, so they belong at the two extremes. */
	.row {
		display: flex;
		align-items: end;
		gap: 0.8em;
	}

	.chart {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}

	.end {
		flex: 0 1 8em;
		min-width: 0;
		font-size: 0.9em;
		font-family: var(--alternative-font);
		font-weight: 700;
		opacity: 0.75;
		padding-bottom: 0.6em;
	}

	.end-high {
		text-align: end;
	}

	.mid {
		text-align: center;
		font-size: 0.85em;
		opacity: 0.7;
	}

	.columns,
	.points,
	.bands {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(0, 1fr));
		gap: 0.4em;
		justify-items: center;
		width: 100%;
		/* Keeps the row from stretching into a wall of squares on a projector,
		   while still shrinking on a phone. */
		max-width: calc(var(--n) * (var(--chip) + 0.4em));
		margin-inline: auto;
	}

	.columns > *,
	.points > *,
	.bands > * {
		width: 100%;
	}

	.columns {
		height: 5em;
		align-items: end;
	}

	.column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 0.25em;
		height: 100%;
		/* So the share below can size itself against its own column. */
		container-type: inline-size;
	}

	/* Same element as the multiple-choice statistics: a solid fill inside a
	   thick deeper border, with a stub left over so a point nobody picked still
	   shows a column rather than vanishing. */
	.column-bar {
		width: 100%;
		height: max(0.5em, var(--h));
		border-radius: 0.45em;
		background: var(--btn-bg);
		border: 0.15em solid var(--btn-deep);
		box-sizing: border-box;
		transition: height 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* A share of the room reads better than a raw count, and the pill keeps it
	   legible where a bare number would sit on top of the bar.
	   Sized to the column, not to its text: content-width pills would make "0%"
	   narrower than "21%", so the stack would stop reading as one column. */
	.tally {
		width: 100%;
		box-sizing: border-box;
		text-align: center;
		/* Eleven columns on a laptop leave a chip narrower than "13%" at the
		   nominal size. Shrinking the text keeps the pill the chip's width;
		   letting the pill grow instead makes neighbours collide. */
		font-size: min(0.75em, 45cqw);
		font-family: var(--alternative-font);
		font-weight: 700;
		padding: 0.15em 0.1em;
		border-radius: 0.35em;
		background: var(--surface-variant);
		border: 0.1em solid var(--outline);
		white-space: nowrap;
	}

	.point {
		appearance: none;
		font: inherit;
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1.25em;
		aspect-ratio: 1;
		width: 100%;
		min-width: 0;
		/* Without this the 0.12em border sits outside the track, so a chip is
		   wider than the bar above it and the column stops lining up. */
		box-sizing: border-box;
		/* A two-digit label must never spill out of its own button. */
		overflow: hidden;
		display: grid;
		place-items: center;
		border-radius: 0.5em;
		border: 0.12em solid var(--outline);
		background: var(--surface-variant);
		color: inherit;
		transition:
			transform 120ms ease-out,
			background 120ms ease-out,
			color 120ms ease-out;
	}

	button.point {
		cursor: pointer;
	}

	button.point:where(:hover, :focus-visible) {
		border-color: var(--primary);
		transform: translateY(-0.1em);
		outline: none;
	}

	.point.selected {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--on-primary);
	}

	/* Only the points somebody actually chose light up, so the shape of the
	   room's answer is readable from the number row alone. */
	.point.voted {
		background: var(--btn-bg);
		border-color: var(--btn-deep);
		color: var(--palette-light);
	}

	.band {
		grid-column: span var(--span);
		box-sizing: border-box;
		text-align: center;
		font-size: 0.7em;
		font-family: var(--alternative-font);
		font-weight: 700;
		padding: 0.15em 0.3em;
		border-radius: 0.3em;
		background: var(--btn-bg);
		color: var(--palette-light);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dense .point {
		font-size: 1em;
		border-radius: 0.4em;
	}

	/* In px, not em: inside a container query `em` resolves against the
	   container's own font-size, and the host sets a larger one, so an em
	   threshold quietly demanded *more* width on the very screen that has the
	   most, and stacked the labels there too. */
	@container (max-width: 560px) {
		.point {
			font-size: 1em;
		}

		.columns {
			height: 3.5em;
		}

		/* Side labels would squeeze the scale itself on a phone, so they drop
		   under it, still at their own ends. */
		.row {
			display: grid;
			grid-template-areas: 'chart chart' 'low high';
			gap: 0.3em 0.5em;
		}

		.chart {
			grid-area: chart;
		}

		.end {
			flex: none;
			padding-bottom: 0;
			font-size: 0.8em;
		}

		.end:not(.end-high) {
			grid-area: low;
		}

		.end-high {
			grid-area: high;
		}

		/* Eleven buttons across a phone leaves ~25px each, too tight to read and
		   too small to hit. Without a bar chart to stay aligned to, a long scale
		   wraps into two comfortable rows instead. */
		.dense:not(.has-counts) .points {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		.dense:not(.has-counts) .point {
			aspect-ratio: auto;
			min-height: 2.4em;
		}

		/* With counts the rows must line up, so the scale stays on one line and
		   gives back the space the gaps were taking. */
		.dense.has-counts .points,
		.dense.has-counts .columns,
		.dense.has-counts .bands {
			gap: 0.15em;
		}

		.dense.has-counts .point {
			font-size: 0.75em;
		}

		.dense.has-counts .tally {
			font-size: 0.55em;
			padding: 0.05em 0.15em;
		}
	}
</style>
