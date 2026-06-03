import { cubicIn, cubicOut } from 'svelte/easing';

type FlyParams = {
	/** Horizontal travel, in vw. */
	x?: number;
	/** Vertical travel, in vh. */
	y?: number;
	/** Rotation at the far end, in degrees. */
	rotate?: number;
	duration?: number;
	delay?: number;
};

// Shared "fly from / to a direction" transition. The same function drives both
// `in:` and `out:` (Svelte runs the css interpolation forwards then backwards),
// so a piece flies in from, and back out to, the vector you give it. Distances
// are viewport-relative so pieces clear small glyphs; clip with overflow on the
// container. Honors prefers-reduced-motion.
function fly(easing: (t: number) => number) {
	return (
		_node: Element,
		{ x = 0, y = 0, rotate = 0, duration = 440, delay = 0 }: FlyParams = {}
	) => {
		if (
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
		) {
			return { duration: 0 };
		}
		return {
			duration,
			delay,
			easing,
			css: (t: number) => {
				const u = 1 - t;
				return `transform: translate(${u * x}vw, ${u * y}vh) rotate(${u * rotate}deg); opacity: ${t};`;
			}
		};
	};
}

/** Decelerating entrance. */
export const flyIn = fly(cubicOut);
/** Accelerating exit. */
export const flyOut = fly(cubicIn);
