import * as m from '$lib/paraglide/messages.js';

/** Renders a duration option; `null` is the host-paced "no timer" choice. */
export function timeMap(value: number | null): string {
	return value === null ? '∞' : `${value / 1000}s`;
}

/** Renders a points option, naming the values authors pick most. */
export function pointsMap(value: number): string {
	if (value === 0) return m.none();
	if (value === 500) return m.half();
	if (value === 1000) return m.regular();
	if (value === 2000) return m.double();
	return String(value);
}

/** Renders a plain count option, e.g. how many entries a player may submit. */
export function countMap(value: number): string {
	return String(value);
}
