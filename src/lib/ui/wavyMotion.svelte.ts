import { Tween } from 'svelte/motion';

/** CSS-style cubic-bezier easing, the same curve Compose's `CubicBezierEasing` draws. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const x = (t: number) => ((ax * t + bx) * t + cx) * t;
	const y = (t: number) => ((ay * t + by) * t + cy) * t;
	const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
	return (progress: number) => {
		if (progress <= 0) return 0;
		if (progress >= 1) return 1;
		let t = progress;
		for (let i = 0; i < 8; i++) {
			const error = x(t) - progress;
			if (Math.abs(error) < 1e-6) return y(t);
			const slope = dx(t);
			if (Math.abs(slope) < 1e-6) break;
			t -= error / slope;
		}
		let lo = 0;
		let hi = 1;
		t = progress;
		while (hi - lo > 1e-6) {
			if (x(t) < progress) lo = t;
			else hi = t;
			t = (lo + hi) / 2;
		}
		return y(t);
	};
}

type Easing = (t: number) => number;

// MotionTokens.
const LINEAR: Easing = (t) => t;
export const STANDARD = cubicBezier(0.2, 0, 0, 1);
const EMPHASIZED_ACCELERATE = cubicBezier(0.3, 0, 0.8, 0.15);
export const EMPHASIZED_DECELERATE = cubicBezier(0.05, 0.7, 0.1, 1);
const DURATION_LONG_2 = 500;

/**
 * A Compose `keyframes {}` spec: each frame is a time, a value, and the easing
 * for the stretch that starts at it.
 */
export function keyframes(time: number, frames: [number, number, Easing?][]): number {
	for (let i = frames.length - 1; i >= 0; i--) {
		const [at, value, easing = LINEAR] = frames[i];
		if (time < at) continue;
		const next = frames[i + 1];
		if (!next) return value;
		return value + (next[1] - value) * easing((time - at) / (next[0] - at));
	}
	return frames[0][1];
}

/** A clock that ticks every frame while mounted, held still under reduced motion. */
export class FrameClock {
	time = $state(0);

	constructor() {
		$effect(() => {
			if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
			let frame = 0;
			const begin = performance.now();
			const tick = (now: number) => {
				this.time = now - begin;
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
			return () => cancelAnimationFrame(frame);
		});
	}
}

/**
 * Determinate progress the way a Compose caller drives it: the value eased
 * with `ProgressAnimationSpec`, and the wave's amplitude switched off below
 * 10% and above 95% by `indicatorAmplitude`, easing in with the standard curve
 * and out with emphasized-accelerate.
 */
export class DeterminateMotion {
	readonly progress: Tween<number>;
	readonly amplitude: Tween<number>;

	constructor(value: () => number) {
		this.progress = new Tween(value(), { duration: DURATION_LONG_2, easing: LINEAR });
		this.amplitude = new Tween(waviness(value()), { duration: DURATION_LONG_2 });

		$effect(() => {
			this.progress.target = value();
		});

		$effect(() => {
			const target = waviness(this.progress.current);
			if (target === this.amplitude.target) return;
			void this.amplitude.set(target, {
				easing: target > this.amplitude.current ? STANDARD : EMPHASIZED_ACCELERATE
			});
		});
	}
}

function waviness(progress: number): number {
	return progress <= 0.1 || progress >= 0.95 ? 0 : 1;
}
