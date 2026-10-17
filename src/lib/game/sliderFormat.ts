import type { SliderRange } from '$lib/types';

/**
 * How many decimals a slider's labels need, taken from its step: a slider of
 * tenths should read "3.4", not "3.4000000000000004", and a whole-number
 * slider should read "3", not "3.0".
 */
function decimalsFor(step: number): number {
	const text = String(step);
	const dot = text.indexOf('.');
	if (dot === -1) return 0;
	return Math.min(6, text.length - dot - 1);
}

/**
 * Snaps a value onto `range`'s step grid, the way a native range input would,
 * without the float noise that stepping by tenths leaves behind.
 */
export function snapSliderValue(value: number, range: SliderRange): number {
	const clamped = Math.max(range.min, Math.min(range.max, value));
	if (range.step <= 0) return clamped;
	let snapped = range.min + Math.round((clamped - range.min) / range.step) * range.step;
	// A max that isn't on the grid can't be reached; stop on the last step before it.
	if (snapped > range.max) snapped -= range.step;
	return Number(snapped.toFixed(decimalsFor(range.step)));
}

/** Formats a value on `range`, appending the slide's unit when it has one. */
export function formatSliderValue(
	value: number,
	range: SliderRange,
	unit?: string | undefined
): string {
	const rounded = value.toFixed(decimalsFor(range.step));
	return unit ? `${rounded}${unit}` : rounded;
}
