<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';
	import Blueberry from '~icons/custom/blueberry';
	import Kiwi from '~icons/custom/kiwi';
	import Orange from '~icons/custom/orange';
	import Strawberry from '~icons/custom/strawberry';

	// The announcement glyph for Multiple Choice: the 2×2 answer grid. Sized in
	// `em` so the parent scene controls the scale.
	const icons = [Strawberry, Blueberry, Kiwi, Orange];

	// Each tile flies from / to its own corner of the grid.
	function corner(i: number) {
		const dx = i % 2 === 0 ? -1 : 1;
		const dy = i < 2 ? -1 : 1;
		return { x: dx * 45, y: dy * 55, rotate: dx * 14 };
	}
</script>

<div class="mcq">
	{#each icons as Icon, i (i)}
		<div
			class="cell palette-{i}"
			in:flyIn|global={{ ...corner(i), duration: 460, delay: i * 70 }}
			out:flyOut|global={{ ...corner(i), duration: 420, delay: i * 45 }}
		>
			<Icon />
		</div>
	{/each}
</div>

<style>
	.mcq {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.55em;
		width: 7.6em;
	}

	.cell {
		aspect-ratio: 1;
		border-radius: 0.55em;
		background: var(--btn-bg);
		box-shadow: 0 0.3em 0 var(--btn-deep);
		color: #ffffff;
		display: grid;
		place-items: center;
	}

	.cell :global(svg) {
		width: 64%;
		height: 64%;
	}
</style>
