<script module lang="ts">
	export type FitMetrics = { length: number; longestWord: number };

	/**
	 * Size metrics for a set of texts that should share one font size: the longest text and the
	 * longest unbreakable word across all of them.
	 */
	export function fitMetrics(texts: string[]): FitMetrics {
		return {
			length: Math.max(1, ...texts.map((t) => t.length)),
			longestWord: Math.max(1, ...texts.flatMap((t) => t.split(/\s+/).map((w) => w.length)))
		};
	}
</script>

<script lang="ts">
	let {
		text,
		metrics = undefined,
		contained = true
	}: {
		text: string;
		metrics?: FitMetrics;
		/**
		 * Fill the parent and fit to it (the default). When false, the text keeps its natural
		 * height and fits to a budget set by `--fit-width` and `--fit-height` instead, usually
		 * in units of an ancestor container, so it only shrinks once it would outgrow that.
		 */
		contained?: boolean;
	} = $props();

	let sizing = $derived(metrics ?? fitMetrics([text]));
</script>

<!--
	Picks the largest font size (between --fit-min and --fit-max) at which `metrics.length`
	characters fit, without measuring in JS. Pass shared `metrics` to give siblings one font
	size. Broken over L lines, the text needs `length + longestWord * (L - 1)` characters of
	width (each break can strand up to one word's worth of space), so the width allows
	`width * L / (advance * that)` and the height allows `height / (line-height * L)`. The font
	size is the best of those over L, capped so the longest word fits on one line.

	Contained, it fills its parent and fits to it. A hidden copy of the text set at --fit-min
	gives it its height when sized to content, so a parent that sizes to content (a grid row,
	say) grows to fit the text at --fit-min rather than letting it spill out.
-->
{#if contained}
	<div class="fit contained" style:--fit-length={sizing.length} style:--fit-word={sizing.longestWord}>
		<span class="ghost" aria-hidden="true">{text}</span>
		<div class="box">
			<span class="text">{text}</span>
		</div>
	</div>
{:else}
	<div class="fit" style:--fit-length={sizing.length} style:--fit-word={sizing.longestWord}>
		<span class="text">{text}</span>
	</div>
{/if}

<style>
	.fit {
		/* Average glyph advance and line height in em, and how many longest words each line
		   break may waste. The defaults are cautious; text that may run a little long (it
		   just takes more room) can loosen them. */
		--advance: var(--fit-advance, 0.6);
		--line-height: var(--fit-line-height, 1.2);
		--slack: calc(var(--fit-word) * var(--fit-slack, 1));
	}

	.fit.contained {
		/* Its own box is the budget, with the cautious estimate, whatever an ancestor set. */
		--fit-width: initial;
		--fit-height: initial;
		--fit-advance: initial;
		--fit-slack: initial;
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
	}

	/* Sets the smallest height the text fits in, wrapped exactly as it would be at --fit-min. */
	.ghost {
		visibility: hidden;
		margin: auto;
		font-size: var(--fit-min, 0.75em);
	}

	.box {
		position: absolute;
		inset: 0;
		container-type: size;
		display: flex;
	}

	.ghost,
	.text {
		display: block;
		line-height: var(--line-height);
		text-align: center;
		overflow-wrap: anywhere;
	}

	.text {
		--by-width: calc(var(--fit-width, 100cqw) / var(--advance));
		--by-height: calc(var(--fit-height, 100cqh) / var(--line-height));

		font-size: clamp(
			var(--fit-min, 0.75em),
			min(
				max(
					min(var(--by-width) / var(--fit-length), var(--by-height)),
					min(
						var(--by-width) * 2 / (var(--fit-length) + var(--slack) * 1),
						var(--by-height) / 2
					),
					min(
						var(--by-width) * 3 / (var(--fit-length) + var(--slack) * 2),
						var(--by-height) / 3
					),
					min(
						var(--by-width) * 4 / (var(--fit-length) + var(--slack) * 3),
						var(--by-height) / 4
					),
					min(
						var(--by-width) * 5 / (var(--fit-length) + var(--slack) * 4),
						var(--by-height) / 5
					),
					min(
						var(--by-width) * 6 / (var(--fit-length) + var(--slack) * 5),
						var(--by-height) / 6
					),
					min(
						var(--by-width) * 8 / (var(--fit-length) + var(--slack) * 7),
						var(--by-height) / 8
					),
					min(
						var(--by-width) * 10 / (var(--fit-length) + var(--slack) * 9),
						var(--by-height) / 10
					)
				),
				var(--by-width) / var(--fit-word)
			),
			var(--fit-max, 2.5em)
		);
		/* Centred by auto margins, which stay in bounds if the text ever runs over. */
		margin: auto;
	}
</style>
