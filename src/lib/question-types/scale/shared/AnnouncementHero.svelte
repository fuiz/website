<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for Scale: five rising bars behind a picked point,
	// the shape of an opinion spread. Sized in `em` so the parent scene scales it.
	const bars = [
		{ palette: 0, height: '38%' },
		{ palette: 1, height: '58%' },
		{ palette: 2, height: '100%' },
		{ palette: 3, height: '72%' },
		{ palette: 4, height: '46%' }
	];
</script>

<div class="scale">
	<div class="bars">
		{#each bars as { palette, height }, i (i)}
			<span
				class="bar palette-{palette}"
				style:--h={height}
				in:flyIn|global={{ y: 55, duration: 440, delay: i * 70 }}
				out:flyOut|global={{ y: 55, duration: 400, delay: i * 35 }}
			></span>
		{/each}
	</div>
	<div
		class="rail"
		in:flyIn|global={{ y: 40, duration: 420, delay: 260 }}
		out:flyOut|global={{ y: 40, duration: 380 }}
	>
		{#each bars as _, i (i)}
			<span class="dot" class:picked={i === 2}></span>
		{/each}
	</div>
</div>

<style>
	.scale {
		display: flex;
		flex-direction: column;
		gap: 0.55em;
		width: 8.6em;
	}

	.bars {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.4em;
		height: 5em;
		align-items: end;
	}

	.bar {
		height: var(--h);
		border-radius: 0.35em 0.35em 0 0;
		background: var(--btn-bg);
		box-shadow: inset 0 -0.2em 0 var(--btn-deep);
	}

	.rail {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.4em;
	}

	.dot {
		height: 0.9em;
		border-radius: 0.3em;
		background: color-mix(in srgb, var(--on-surface) 20%, transparent);
	}

	.dot.picked {
		background: var(--primary);
	}
</style>
