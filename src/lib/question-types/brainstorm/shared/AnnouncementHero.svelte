<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for Brainstorm: sticky notes landing on a board.
	const notes = [
		{ palette: 0, rotate: -6, dir: { x: -62, y: -24, rotate: -12 } },
		{ palette: 3, rotate: 4, dir: { x: 58, y: -18, rotate: 10 } },
		{ palette: 1, rotate: 7, dir: { x: -50, y: 30, rotate: -9 } },
		{ palette: 2, rotate: -3, dir: { x: 55, y: 30, rotate: 8 } }
	];
</script>

<div class="board">
	{#each notes as note, i (i)}
		<span
			class="note palette-{note.palette}"
			style:--r="{note.rotate}deg"
			in:flyIn|global={{ ...note.dir, duration: 460, delay: i * 80 }}
			out:flyOut|global={{ ...note.dir, duration: 420, delay: i * 40 }}
		>
			<span class="line"></span>
			<span class="line short"></span>
		</span>
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.6em;
		width: 8.8em;
	}

	.note {
		aspect-ratio: 1;
		border-radius: 0.4em;
		background: var(--btn-bg);
		box-shadow: 0 0.26em 0 var(--btn-deep);
		rotate: var(--r);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.3em;
		padding: 0.55em;
		box-sizing: border-box;
	}

	.line {
		height: 0.28em;
		border-radius: 1em;
		background: rgba(255, 255, 255, 0.75);
	}

	.line.short {
		width: 60%;
	}
</style>
