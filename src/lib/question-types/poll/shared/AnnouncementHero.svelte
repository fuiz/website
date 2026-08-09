<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for Poll: the vote split into bars, which is exactly
	// what the results screen puts on the projector a moment later.
	//
	// The bar is the same object `ResultBars` draws, a palette fill inside a
	// thicker border of its own deeper shade, so the splash and the results
	// agree. Palette slots run 0, 1, 2 because that is what a three-option poll
	// actually colours its answers.
	//
	// Uneven widths rather than a tidy ramp: a poll is interesting precisely
	// because the room disagrees.
	const rows = [
		{ palette: 0, width: '82%' },
		{ palette: 1, width: '46%' },
		{ palette: 2, width: '64%' }
	];

	// Each bar flies from / to its own side, fanned vertically.
	const dirs = [
		{ x: -60, y: -20, rotate: -8 },
		{ x: 62, y: 0, rotate: 9 },
		{ x: -58, y: 26, rotate: -7 }
	];
</script>

<div class="poll">
	{#each rows as { palette, width }, i (i)}
		<div
			class="row"
			in:flyIn|global={{ ...dirs[i], duration: 460, delay: i * 85 }}
			out:flyOut|global={{ ...dirs[i], duration: 420, delay: i * 40 }}
		>
			<span class="bar palette-{palette}" style:--w={width}></span>
		</div>
	{/each}
</div>

<style>
	.poll {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width: 8.6em;
	}

	.row {
		display: flex;
	}

	.bar {
		width: var(--w);
		height: 1.9em;
		border-radius: 0.4em;
		background: var(--btn-bg);
		border: 0.14em solid var(--btn-deep);
		box-sizing: border-box;
	}
</style>
