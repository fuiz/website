import type { PinPoint, PinShape } from '$lib/types';

/** Sorts a pair so a shape dragged out backwards still describes its box. */
function ordered(a: number, b: number): [number, number] {
	return a <= b ? [a, b] : [b, a];
}

/** Even-odd ray casting, mirroring the server's `contains_in_polygon`. */
function insidePolygon(points: PinPoint[], probe: PinPoint): boolean {
	if (points.length < 3) return false;
	let inside = false;
	let previous = points[points.length - 1];
	for (const current of points) {
		if (current.y > probe.y !== previous.y > probe.y) {
			const span = previous.y - current.y;
			if (span !== 0) {
				const crossingX = ((previous.x - current.x) * (probe.y - current.y)) / span + current.x;
				if (probe.x < crossingX) inside = !inside;
			}
		}
		previous = current;
	}
	return inside;
}

/**
 * Whether a pin landed inside the target, mirroring the server's test in
 * `game/logic/src/fuiz/pin.rs`.
 *
 * A degenerate shape contains nothing, and the safe reading is that nobody scores
 * rather than everybody.
 */
export function isPinOnTarget(pin: PinPoint | undefined, shape: PinShape | undefined): boolean {
	if (!pin || !shape) return false;

	if ('Rectangle' in shape) {
		const { x, y, width, height } = shape.Rectangle;
		const [left, right] = ordered(x, x + width);
		const [top, bottom] = ordered(y, y + height);
		return pin.x >= left && pin.x <= right && pin.y >= top && pin.y <= bottom;
	}

	if ('Ellipse' in shape) {
		const { center, radius_x, radius_y } = shape.Ellipse;
		if (!(radius_x > 0) || !(radius_y > 0)) return false;
		const dx = (pin.x - center.x) / radius_x;
		const dy = (pin.y - center.y) / radius_y;
		return dx * dx + dy * dy <= 1;
	}

	return insidePolygon(shape.Polygon.points, pin);
}

/** True when the shape encloses no area, so nothing could ever be correct. */
export function isDegenerateShape(shape: PinShape | undefined | null): boolean {
	if (!shape) return true;
	if ('Rectangle' in shape) {
		return Math.abs(shape.Rectangle.width) < 1e-4 || Math.abs(shape.Rectangle.height) < 1e-4;
	}
	if ('Ellipse' in shape) {
		return shape.Ellipse.radius_x < 1e-4 || shape.Ellipse.radius_y < 1e-4;
	}
	return shape.Polygon.points.length < 3;
}
