<script lang="ts">
	import { flyIn, flyOut } from '$lib/animation/flyAway';

	// The announcement glyph for Pin. Abstract landmasses and a river carry the
	// idea of a picture worth marking without shipping an actual photograph.
	// Sized in `em` so the parent scene controls the scale.
	let {
		/** Whether there is a target to aim at, or every pin counts equally. */
		scored = true
	}: { scored?: boolean } = $props();

	// A pin answer is one marker landing on a bullseye. A drop pin is the room
	// spread across the whole picture with nothing to be right about, so it gets
	// markers in four colours and no target at all.
	//
	// They fan out rather than huddling in the middle, and the lower ones are
	// drawn larger, since low in a picture reads as near the viewer, which stops a
	// flat scatter from looking like a row.
	const scatter = [
		{ x: '25%', y: '38%', size: '1.3em', palette: 1, delay: 200 },
		{ x: '58%', y: '28%', size: '1.15em', palette: 3, delay: 290 },
		{ x: '41%', y: '72%', size: '1.75em', palette: 0, delay: 380 },
		{ x: '76%', y: '62%', size: '1.55em', palette: 5, delay: 470 }
	];

	// Two other players' pins, to say that everyone marks a spot even when only
	// one place is right.
	const others = [
		{ x: '17%', y: '72%', size: '0.85em', delay: 300 },
		{ x: '83%', y: '30%', size: '0.75em', delay: 380 }
	];
</script>

{#snippet marker(palette: number | undefined, delay: number, size: string)}
	<span
		class={['marker', palette === undefined ? 'muted' : `palette-${palette}`]}
		style:--size={size}
		in:flyIn|global={{ y: -60, duration: 480, delay }}
		out:flyOut|global={{ y: -60, duration: 400, delay: delay / 4 }}
	></span>
{/snippet}

{#snippet spot(x: string, y: string, size: string, palette: number | undefined, delay: number)}
	<span class="spot" style:--x={x} style:--y={y} style:--size={size}>
		<span class="shadow"></span>
		{@render marker(palette, delay, size)}
	</span>
{/snippet}

<div class="pin">
	<div
		class="card"
		in:flyIn|global={{ y: -40, rotate: -4, duration: 460 }}
		out:flyOut|global={{ y: -40, rotate: -4, duration: 420 }}
	>
		<svg class="map" viewBox="0 0 100 75" aria-hidden="true">
			<path class="land" d="M6 44 Q16 28 33 31 Q47 34 51 48 Q53 62 37 65 Q16 67 6 56 Z" />
			<path class="land" d="M63 10 Q79 6 89 17 Q96 25 87 33 Q73 41 65 31 Q59 21 63 10 Z" />
			<path class="river" d="M0 20 Q24 16 39 25 Q55 35 73 45 Q87 53 100 50" />
		</svg>

		{#if scored}
			<!-- The target, then the marker landing on it. -->
			<span
				class="target"
				in:flyIn|global={{ y: 20, duration: 400, delay: 160 }}
				out:flyOut|global={{ y: 20, duration: 380 }}
			></span>

			{#each others as other (other.x)}
				{@render spot(other.x, other.y, other.size, undefined, other.delay)}
			{/each}

			{@render spot('50%', '55%', '1.6em', 0, 240)}
		{:else}
			{#each scatter as pin (pin.x)}
				{@render spot(pin.x, pin.y, pin.size, pin.palette, pin.delay)}
			{/each}
		{/if}
	</div>
</div>

<style>
	.pin {
		width: 9.4em;
	}

	.card {
		position: relative;
		width: 100%;
		aspect-ratio: 4 / 3;
		border-radius: 0.7em;
		background: var(--surface-variant);
		border: 0.12em solid color-mix(in srgb, var(--on-surface) 16%, transparent);
		overflow: hidden;
	}

	.map {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* Stronger than feels right in isolation: at splash size the glyph is small
	   on screen, and a fainter map disappears behind the markers. */
	.land {
		fill: color-mix(in srgb, var(--on-surface) 18%, transparent);
	}

	.river {
		fill: none;
		stroke: color-mix(in srgb, var(--on-surface) 26%, transparent);
		stroke-width: 3.4;
		stroke-linecap: round;
	}

	/* Rings rippling out from where the point lands, rather than a disc sitting
	   behind the marker. A filled disc wider than the marker would merge with it
	   into one pink smudge, leaving the marker reading as floating above the
	   target instead of planted on it. No fill here, and both rings tuned inside
	   the marker's own width, so the map still shows through and the eye goes to
	   the spot. */
	.target {
		position: absolute;
		left: 50%;
		top: 55%;
		/* Not `transform`: the fly transition animates that, and would drop this
		   centring for the length of the flight. `translate` composes. */
		translate: -50% -50%;
		width: 2.9em;
		height: 2.9em;
		border-radius: 50%;
		border: 0.16em solid color-mix(in srgb, var(--primary) 40%, transparent);
	}

	.target::after {
		content: '';
		position: absolute;
		inset: 0.5em;
		border-radius: 50%;
		border: 0.16em solid color-mix(in srgb, var(--primary) 72%, transparent);
	}

	/* Anchors a marker and its ground shadow to one point on the map. */
	.spot {
		position: absolute;
		left: var(--x);
		top: var(--y);
	}

	/* The ground shadow sells the marker as landing rather than floating, and
	   tracks its size so a small pin doesn't cast a large one. */
	.shadow {
		position: absolute;
		left: 0;
		top: 0;
		translate: -50% -50%;
		width: calc(var(--size) * 0.6);
		height: calc(var(--size) * 0.24);
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.22);
	}

	/* The classic teardrop: a circle with one corner squared off, turned 45deg, so
	   its point lands on the spot. */
	.marker {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--size);
		height: var(--size);
		/* Land the point, not the box, on the spot. The box starts with its
		   top-left at the spot, so its centre is half a marker down; rotating 45deg
		   then puts the sharp corner a further sqrt(2)/2 below that. Lifting by the
		   sum (0.5 + 0.707) is what makes the tip meet its own shadow. */
		translate: -50% -120.7%;
		rotate: -45deg;
		border-radius: 50% 50% 50% 0;
		background: var(--btn-bg);
		box-shadow: 0 0.15em 0.25em rgba(0, 0, 0, 0.35);
	}

	.marker::after {
		content: '';
		position: absolute;
		inset: 30%;
		border-radius: 50%;
		background: var(--surface);
	}

	/* Someone else's pin: the same marker, stepped well back so the answer stays
	   the subject. */
	.marker.muted {
		background: color-mix(in srgb, var(--on-surface) 30%, transparent);
		box-shadow: none;
		opacity: 0.75;
	}
</style>
