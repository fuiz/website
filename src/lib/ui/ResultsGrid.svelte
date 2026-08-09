<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { type PlayerRow, scoreLevel } from '$lib/reports';

	let {
		rows,
		maxima,
		questionTitles
	}: {
		rows: PlayerRow[];
		maxima: number[];
		questionTitles: string[];
	} = $props();
</script>

<div class="scroll">
	<div class="grid" style:--columns={questionTitles.length}>
		<span class="corner"></span>
		{#each questionTitles as title, index (index)}
			<span class="head" title="{index + 1}. {title}">{index + 1}</span>
		{/each}
		<span class="head"></span>
		<span class="head"></span>

		{#each rows as row, rank (row.name)}
			<span class="who">
				<span class="rank">{rank + 1}</span>
				<span class="name" title={row.name}>{row.name}</span>
			</span>
			{#each questionTitles as title, index (index)}
				{@const score = row.scores.at(index) ?? 0}
				<span
					class="cell"
					data-level={scoreLevel(score, maxima.at(index) ?? 0)}
					title="{row.name} — {index + 1}. {title}: {score} {m.points()}"
				></span>
			{/each}
			<span class="fraction" title={m.correct()}>
				{row.correctCount}/{questionTitles.length}
			</span>
			<span class="total" title={m.points()}>{row.total.toLocaleString(getLocale())}</span>
		{/each}
	</div>
</div>

<style>
	.scroll {
		overflow-x: auto;
		padding-bottom: 0.2em;
	}

	.grid {
		display: grid;
		grid-template-columns:
			minmax(6em, max-content)
			repeat(var(--columns), 1.1em)
			auto
			auto;
		gap: 0.15em;
		align-items: center;
		/* Content width only. Stretching to 100% makes the trailing `auto` columns soak up
		   the slack, stranding the totals at the far edge with a gap of nothing. */
		width: max-content;
	}

	/*
	 * No opaque backdrop, so the page's own background shows through instead of a cream
	 * patch sitting on it, and therefore no `position: sticky` either: pinning this column
	 * only works if something hides the cells sliding underneath it.
	 */
	.who {
		display: flex;
		align-items: baseline;
		gap: 0.4em;
		padding-right: 0.5em;
		font-size: 0.75em;
		min-width: 0;
	}

	.rank {
		min-width: 1.5em;
		opacity: 0.5;
		font-variant-numeric: tabular-nums;
	}

	.name {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.head {
		font-size: 0.6em;
		text-align: center;
		opacity: 0.6;
		font-variant-numeric: tabular-nums;
	}

	.cell {
		height: 1.1em;
		border-radius: 0.15em;
		background: color-mix(in srgb, var(--on-surface) 12%, transparent);
	}

	.cell[data-level='1'] {
		background: color-mix(in srgb, var(--correct) 35%, var(--surface));
	}

	.cell[data-level='2'] {
		background: color-mix(in srgb, var(--correct) 65%, var(--surface));
	}

	.cell[data-level='3'] {
		background: var(--correct);
	}

	.fraction,
	.total {
		font-size: 0.75em;
		font-variant-numeric: tabular-nums;
		text-align: end;
		white-space: nowrap;
	}

	.fraction {
		padding-left: 0.6em;
		opacity: 0.7;
	}

	.total {
		padding-left: 0.5em;
		font-weight: 700;
	}
</style>
