<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for Slider: a value bubble hanging over a filled
	// track, which is the shape people recognise a slider by. Sized in `em` so
	// the parent scene controls the scale.

	// Where the thumb sits along the track, and so how much of it reads as
	// "chosen". Ticks up to here take the accent colour.
	const FILL = 62;
	const ticks = [0, 1, 2, 3, 4, 5, 6];
</script>

<div class="slider">
	<!-- The bubble drops onto the thumb, the way a slider's tooltip follows it. -->
	<div
		class="bubble-row"
		in:flyIn|global={{ y: -45, duration: 460, delay: 140 }}
		out:flyOut|global={{ y: -45, duration: 420, delay: 60 }}
	>
		<div class="bubble palette-0" style:--x="{FILL}%">
			<span class="bubble-value"></span>
		</div>
	</div>

	<div
		class="rail"
		in:flyIn|global={{ x: -60, rotate: -5, duration: 460 }}
		out:flyOut|global={{ x: -60, rotate: -5, duration: 420 }}
	>
		<span class="fill palette-0" style:--w="{FILL}%"></span>
		<span class="thumb palette-0" style:--x="{FILL}%"></span>
	</div>

	<div class="ticks">
		{#each ticks as tick, i (tick)}
			<span
				class="tick"
				class:lit={(i / (ticks.length - 1)) * 100 <= FILL}
				in:flyIn|global={{ y: 40, duration: 420, delay: 180 + i * 45 }}
				out:flyOut|global={{ y: 40, duration: 380, delay: i * 25 }}
			></span>
		{/each}
	</div>
</div>

<style>
	.slider {
		display: flex;
		flex-direction: column;
		width: 9.5em;
	}

	.bubble-row {
		position: relative;
		height: 2.6em;
	}

	.bubble {
		position: absolute;
		left: var(--x);
		bottom: 0.45em;
		transform: translateX(-50%);
		min-width: 3.1em;
		padding: 0.5em 0.55em;
		border-radius: 0.55em;
		background: var(--btn-bg);
		box-shadow: 0 0.24em 0 var(--btn-deep);
		display: grid;
		place-items: center;
	}

	/* The tail that points the bubble at the thumb. */
	.bubble::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-inline: 0.4em solid transparent;
		border-top: 0.42em solid var(--btn-deep);
	}

	/* A bar rather than a number: the glyph has to read the same in every
	   language. */
	.bubble-value {
		width: 1.5em;
		height: 0.34em;
		border-radius: 1em;
		background: rgba(255, 255, 255, 0.92);
	}

	.rail {
		position: relative;
		height: 1em;
		border-radius: 1em;
		background: var(--surface-variant);
		border: 0.12em solid color-mix(in srgb, var(--on-surface) 14%, transparent);
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		width: var(--w);
		border-radius: 1em 0 0 1em;
		background: var(--btn-bg);
	}

	.thumb {
		position: absolute;
		left: var(--x);
		top: 50%;
		transform: translate(-50%, -50%);
		width: 2em;
		height: 2em;
		border-radius: 50%;
		background: var(--btn-bg);
		border: 0.22em solid var(--surface);
		box-shadow: 0 0.26em 0 var(--btn-deep);
	}

	.ticks {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.42em;
		margin-top: 0.85em;
	}

	.tick {
		height: 0.5em;
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 18%, transparent);
	}

	.tick.lit {
		background: color-mix(in srgb, var(--primary) 55%, transparent);
	}
</style>
