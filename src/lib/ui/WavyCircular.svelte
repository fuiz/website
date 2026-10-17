<script lang="ts">
	import {
		DeterminateMotion,
		EMPHASIZED_DECELERATE,
		FrameClock,
		keyframes,
		STANDARD
	} from './wavyMotion.svelte';
	import { type CircularSpec, circularFrame, circularShapes } from './wavyProgress';

	/**
	 * Material 3 Expressive's `CircularWavyProgressIndicator`, ported from
	 * Jetpack Compose: the same rounded-star wave, gap and motion. The spec draws
	 * it 48px across with a 4px line, or 52px with 8px for `thick`; `size`
	 * scales either down so it can sit in a line of text. Leave `value` out for
	 * the indeterminate version.
	 */
	let {
		value = undefined,
		size = 48,
		thick = false,
		label
	}: { value?: number; size?: number; thick?: boolean; label: string } = $props();

	// The mode is fixed for the life of the component, like choosing one of
	// Compose's two overloads.
	// svelte-ignore state_referenced_locally
	const determinate = value !== undefined;

	let spec = $derived.by<CircularSpec>(() => {
		const k = size / (thick ? 52 : 48);
		const stroke = (thick ? 8 : 4) * k;
		return { size, stroke, trackStroke: stroke, gap: 4 * k, wavelength: 15 * k };
	});
	let shapes = $derived(circularShapes(spec));

	const clock = new FrameClock();
	const motion = determinate ? new DeterminateMotion(() => value ?? 0) : undefined;

	let amplitude = $derived(motion ? motion.amplitude.current : 1);
	// One wavelength a second, which takes a vertex count of seconds to go round.
	let offset = $derived.by(() => {
		if (amplitude <= 0) return 0;
		const period = 1000 * shapes.n;
		return (clock.time % period) / period;
	});

	// CircularAnimationProgressDuration and its rotation and sweep keyframes.
	const CYCLE = 6000;
	let sweep = $derived(
		keyframes(clock.time % CYCLE, [
			[0, 0.1],
			[3000, 0.87, STANDARD],
			[CYCLE, 0.1]
		])
	);
	let rotation = $derived.by(() => {
		const t = clock.time % CYCLE;
		const global = (t / CYCLE) * 1080;
		const extra = keyframes(t, [
			[0, 0],
			[300, 90, EMPHASIZED_DECELERATE],
			[1500, 90],
			[1800, 180],
			[3000, 180],
			[3300, 270],
			[4500, 270],
			[4800, 360],
			[CYCLE, 360]
		]);
		return global + extra + 90;
	});

	let frame = $derived(
		circularFrame(
			spec,
			shapes,
			motion ? Math.min(1, Math.max(0, motion.progress.current)) : sweep,
			amplitude,
			offset
		)
	);
</script>

<svg
	class="wavy"
	viewBox="0 0 {size} {size}"
	width={size}
	height={size}
	role="progressbar"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={value === undefined ? undefined : Math.round(value * 100)}
>
	<g transform={determinate ? undefined : `rotate(${rotation} ${size / 2} ${size / 2})`}>
		<path class="track" d={frame.track} stroke-width={spec.trackStroke} />
		<path class="active" d={frame.active} stroke-width={spec.stroke} />
	</g>
</svg>

<style>
	.wavy {
		display: block;
		flex: none;
	}

	path {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.active {
		stroke: var(--wavy-active, var(--primary));
	}

	.track {
		stroke: var(--wavy-track, var(--surface-variant));
	}
</style>
