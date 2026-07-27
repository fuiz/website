<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for free text: word-shaped blanks of different
	// weights settling into a cloud. They're shapes rather than sample words so
	// the splash reads the same in every language. Sized in `em` so the parent
	// scene controls the scale.
	const words = [
		{ width: '4.4em', height: '1.2em', palette: 0, dir: { x: -60, y: -20, rotate: -10 } },
		{ width: '2.6em', height: '0.8em', palette: 2, dir: { x: 55, y: -28, rotate: 9 } },
		{ width: '3.6em', height: '1em', palette: 1, dir: { x: -45, y: 30, rotate: -7 } },
		{ width: '2.2em', height: '0.75em', palette: 3, dir: { x: 60, y: 26, rotate: 11 } }
	];
</script>

<div class="cloud">
	{#each words as word, i (i)}
		<span
			class="word palette-{word.palette}"
			style:--w={word.width}
			style:--h={word.height}
			in:flyIn|global={{ ...word.dir, duration: 460, delay: i * 80 }}
			out:flyOut|global={{ ...word.dir, duration: 420, delay: i * 40 }}
		></span>
	{/each}
</div>

<style>
	.cloud {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.45em 0.5em;
		width: 9em;
	}

	.word {
		width: var(--w);
		height: var(--h);
		border-radius: 1em;
		background: var(--btn-bg);
	}
</style>
