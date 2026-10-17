/**
 * Geometry for Material 3 Expressive's wavy circular progress indicator,
 * ported from Jetpack Compose (`material3/internal/CircularWavyProgressModifiers.kt`)
 * and the `graphics-shapes` library it builds the wave from (`RoundedPolygon`,
 * `RoundedCorner`, `Cubic`).
 *
 * Everything is in pixels. Paths are flattened to polylines with an
 * arc-length table so segments can be cut by distance, as Compose's
 * `PathMeasure.getSegment` does.
 */

type Point = { x: number; y: number };
/** a0x, a0y, c0x, c0y, c1x, c1y, a1x, a1y */
type Cubic = [number, number, number, number, number, number, number, number];

const DISTANCE_EPSILON = 1e-4;

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;
const length = (a: Point) => Math.hypot(a.x, a.y);
const direction = (a: Point): Point => mul(a, 1 / length(a));
const rotate90 = (a: Point): Point => ({ x: -a.y, y: a.x });
const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;
const lerpPoint = (a: Point, b: Point, t: number): Point => ({
	x: lerp(a.x, b.x, t),
	y: lerp(a.y, b.y, t)
});

function cubic(a0: Point, c0: Point, c1: Point, a1: Point): Cubic {
	return [a0.x, a0.y, c0.x, c0.y, c1.x, c1.y, a1.x, a1.y];
}

function straightLine(x0: number, y0: number, x1: number, y1: number): Cubic {
	return [
		x0,
		y0,
		lerp(x0, x1, 1 / 3),
		lerp(y0, y1, 1 / 3),
		lerp(x0, x1, 2 / 3),
		lerp(y0, y1, 2 / 3),
		x1,
		y1
	];
}

function reverse(c: Cubic): Cubic {
	return [c[6], c[7], c[4], c[5], c[2], c[3], c[0], c[1]];
}

function zeroLength(c: Cubic) {
	return Math.abs(c[0] - c[6]) < DISTANCE_EPSILON && Math.abs(c[1] - c[7]) < DISTANCE_EPSILON;
}

function pointOnCurve(c: Cubic, t: number): Point {
	const u = 1 - t;
	return {
		x: c[0] * u * u * u + c[2] * 3 * t * u * u + c[4] * 3 * t * t * u + c[6] * t * t * t,
		y: c[1] * u * u * u + c[3] * 3 * t * u * u + c[5] * 3 * t * t * u + c[7] * t * t * t
	};
}

function split(c: Cubic, t: number): [Cubic, Cubic] {
	const u = 1 - t;
	const p = pointOnCurve(c, t);
	return [
		[
			c[0],
			c[1],
			c[0] * u + c[2] * t,
			c[1] * u + c[3] * t,
			c[0] * u * u + c[2] * 2 * u * t + c[4] * t * t,
			c[1] * u * u + c[3] * 2 * u * t + c[5] * t * t,
			p.x,
			p.y
		],
		[
			p.x,
			p.y,
			c[2] * u * u + c[4] * 2 * u * t + c[6] * t * t,
			c[3] * u * u + c[5] * 2 * u * t + c[7] * t * t,
			c[4] * u + c[6] * t,
			c[5] * u + c[7] * t,
			c[6],
			c[7]
		]
	];
}

function circularArc(center: Point, p0: Point, p1: Point): Cubic {
	const p0d = direction(sub(p0, center));
	const p1d = direction(sub(p1, center));
	const r0 = rotate90(p0d);
	const r1 = rotate90(p1d);
	const clockwise = dot(r0, sub(p1, center)) >= 0;
	const cosa = dot(p0d, p1d);
	if (cosa > 0.999) return straightLine(p0.x, p0.y, p1.x, p1.y);
	const k =
		((((length(sub(p0, center)) * 4) / 3) *
			(Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa))) /
			(1 - cosa)) *
		(clockwise ? 1 : -1);
	return cubic(p0, add(p0, mul(r0, k)), sub(p1, mul(r1, k)), p1);
}

type Rounding = { radius: number; smoothing: number };

/** `RoundedCorner` from graphics-shapes: one vertex's rounded, smoothed corner. */
function roundedCorner(p0: Point, p1: Point, p2: Point, rounding: Rounding) {
	const v01 = sub(p0, p1);
	const v21 = sub(p2, p1);
	const d01 = length(v01);
	const d21 = length(v21);
	let d1: Point = { x: 0, y: 0 };
	let d2: Point = { x: 0, y: 0 };
	let radius = 0;
	let smoothing = 0;
	let expectedRoundCut = 0;
	if (d01 > 0 && d21 > 0) {
		d1 = mul(v01, 1 / d01);
		d2 = mul(v21, 1 / d21);
		radius = rounding.radius;
		smoothing = rounding.smoothing;
		const cosAngle = dot(d1, d2);
		const sinAngle = Math.sqrt(1 - cosAngle * cosAngle);
		expectedRoundCut = sinAngle > 1e-3 ? (radius * (cosAngle + 1)) / sinAngle : 0;
	}
	const expectedCut = (1 + smoothing) * expectedRoundCut;

	const actualSmoothing = (allowedCut: number) =>
		allowedCut > expectedCut
			? smoothing
			: allowedCut > expectedRoundCut
				? (smoothing * (allowedCut - expectedRoundCut)) / (expectedCut - expectedRoundCut)
				: 0;

	function lineIntersection(q0: Point, e0: Point, q1: Point, e1: Point): Point | undefined {
		const rotated = rotate90(e1);
		const den = dot(e0, rotated);
		if (Math.abs(den) < DISTANCE_EPSILON) return undefined;
		const num = dot(sub(q1, q0), rotated);
		if (Math.abs(den) < DISTANCE_EPSILON * Math.abs(num)) return undefined;
		return add(q0, mul(e0, num / den));
	}

	function flanking(
		roundCut: number,
		smooth: number,
		sideStart: Point,
		intersection: Point,
		otherIntersection: Point,
		center: Point,
		r: number
	): Cubic {
		const sideDirection = direction(sub(sideStart, p1));
		const curveStart = add(p1, mul(sideDirection, roundCut * (1 + smooth)));
		const p = lerpPoint(intersection, mul(add(intersection, otherIntersection), 0.5), smooth);
		const curveEnd = add(center, mul(direction(sub(p, center)), r));
		const tangent = rotate90(sub(curveEnd, center));
		const anchorEnd = lineIntersection(sideStart, sideDirection, curveEnd, tangent) ?? intersection;
		const anchorStart = mul(add(curveStart, mul(anchorEnd, 2)), 1 / 3);
		return cubic(curveStart, anchorStart, anchorEnd, curveEnd);
	}

	function getCubics(allowedCut0: number, allowedCut1: number): Cubic[] {
		const allowedCut = Math.min(allowedCut0, allowedCut1);
		if (
			expectedRoundCut < DISTANCE_EPSILON ||
			allowedCut < DISTANCE_EPSILON ||
			radius < DISTANCE_EPSILON
		) {
			return [straightLine(p1.x, p1.y, p1.x, p1.y)];
		}
		const roundCut = Math.min(allowedCut, expectedRoundCut);
		const r = (radius * roundCut) / expectedRoundCut;
		const centerDistance = Math.hypot(r, roundCut);
		const center = add(p1, mul(direction(mul(add(d1, d2), 0.5)), centerDistance));
		const i0 = add(p1, mul(d1, roundCut));
		const i2 = add(p1, mul(d2, roundCut));
		const f0 = flanking(roundCut, actualSmoothing(allowedCut0), p0, i0, i2, center, r);
		const f2 = reverse(flanking(roundCut, actualSmoothing(allowedCut1), p2, i2, i0, center, r));
		return [f0, circularArc(center, { x: f0[6], y: f0[7] }, { x: f2[0], y: f2[1] }), f2];
	}

	return { expectedRoundCut, expectedCut, getCubics };
}

/** `RoundedPolygon(vertices, perVertexRounding)` followed by its `cubics` list. */
function roundedPolygon(
	vertices: Point[],
	roundings: Rounding[]
): { cubics: Cubic[]; center: Point } {
	const n = vertices.length;
	const corners = vertices.map((v, i) =>
		roundedCorner(vertices[(i + n - 1) % n], v, vertices[(i + 1) % n], roundings[i])
	);
	const cutAdjusts = vertices.map((v, ix) => {
		const next = (ix + 1) % n;
		const expectedRoundCut = corners[ix].expectedRoundCut + corners[next].expectedRoundCut;
		const expectedCut = corners[ix].expectedCut + corners[next].expectedCut;
		const side = length(sub(v, vertices[next]));
		if (expectedRoundCut > side) return [side / expectedRoundCut, 0];
		if (expectedCut > side)
			return [1, (side - expectedRoundCut) / (expectedCut - expectedRoundCut)];
		return [1, 1];
	});
	const cornerCubics = corners.map((corner, i) => {
		const allowed = [0, 1].map((delta) => {
			const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n];
			return (
				corner.expectedRoundCut * roundCutRatio +
				(corner.expectedCut - corner.expectedRoundCut) * cutRatio
			);
		});
		return corner.getCubics(allowed[0], allowed[1]);
	});
	const features: Cubic[][] = [];
	for (let i = 0; i < n; i++) {
		const here = cornerCubics[i];
		const next = cornerCubics[(i + 1) % n];
		features.push(here);
		const end = here[here.length - 1];
		features.push([straightLine(end[6], end[7], next[0][0], next[0][1])]);
	}

	// Start halfway round the first corner, as RoundedPolygon does, merging any
	// zero-length curves into their neighbours.
	let splitStart: Cubic[] | undefined;
	let splitEnd: Cubic[] | undefined;
	if (features[0].length === 3) {
		const [start, end] = split(features[0][1], 0.5);
		splitStart = [features[0][0], start];
		splitEnd = [end, features[0][2]];
	}
	const cubics: Cubic[] = [];
	let first: Cubic | undefined;
	let last: Cubic | undefined;
	for (let i = 0; i <= features.length; i++) {
		let list: Cubic[];
		if (i === 0 && splitEnd) list = splitEnd;
		else if (i === features.length) {
			if (!splitStart) break;
			list = splitStart;
		} else list = features[i];
		for (const c of list) {
			if (!zeroLength(c)) {
				if (last) cubics.push(last);
				last = c;
				first ??= c;
			} else if (last) {
				last = [...last] as Cubic;
				last[6] = c[6];
				last[7] = c[7];
			}
		}
	}
	if (last && first)
		cubics.push([last[0], last[1], last[2], last[3], last[4], last[5], first[0], first[1]]);
	return { cubics, center: { x: 0, y: 0 } };
}

/** `RoundedPolygon.normalized()`: fit the control-point bounds into the unit square. */
function normalized(shape: { cubics: Cubic[]; center: Point }) {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const c of shape.cubics) {
		for (let i = 0; i < 8; i += 2) {
			minX = Math.min(minX, c[i]);
			maxX = Math.max(maxX, c[i]);
			minY = Math.min(minY, c[i + 1]);
			maxY = Math.max(maxY, c[i + 1]);
		}
	}
	const side = Math.max(maxX - minX, maxY - minY);
	const ox = (side - (maxX - minX)) / 2 - minX;
	const oy = (side - (maxY - minY)) / 2 - minY;
	const map = (x: number, y: number) => [(x + ox) / side, (y + oy) / side];
	return {
		cubics: shape.cubics.map(
			(c) =>
				[...map(c[0], c[1]), ...map(c[2], c[3]), ...map(c[4], c[5]), ...map(c[6], c[7])] as Cubic
		),
		center: { x: (shape.center.x + ox) / side, y: (shape.center.y + oy) / side }
	};
}

/** A flattened closed path with cumulative arc lengths, for cutting by distance. */
type Measured = { xs: Float64Array; ys: Float64Array; at: Float64Array; total: number };

function measure(points: Point[]): Measured {
	const count = points.length;
	const xs = new Float64Array(count);
	const ys = new Float64Array(count);
	const at = new Float64Array(count);
	for (let i = 0; i < count; i++) {
		xs[i] = points[i].x;
		ys[i] = points[i].y;
		if (i > 0) at[i] = at[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
	}
	return { xs, ys, at, total: at[count - 1] };
}

function pointAt(m: Measured, distance: number): Point {
	const d = Math.min(Math.max(distance, 0), m.total);
	let lo = 0;
	let hi = m.at.length - 1;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (m.at[mid] <= d) lo = mid;
		else hi = mid;
	}
	const span = m.at[hi] - m.at[lo];
	const t = span > 0 ? (d - m.at[lo]) / span : 0;
	return { x: lerp(m.xs[lo], m.xs[hi], t), y: lerp(m.ys[lo], m.ys[hi], t) };
}

/**
 * The stretch of `m` from `from` to `to`. With `loop`, distances past the end
 * carry on round from the start, like the doubled path Compose cuts its moving
 * wave from; without it they are clamped, like `PathMeasure.getSegment`.
 */
function segment(m: Measured, from: number, to: number, loop = false): Point[] {
	if (!loop) {
		from = Math.max(0, from);
		to = Math.min(m.total, to);
	}
	if (to - from <= 0) return [];
	const out: Point[] = [];
	const firstLap = Math.floor(from / m.total);
	const lastLap = Math.ceil(to / m.total) - 1;
	for (let lap = firstLap; lap <= lastLap; lap++) {
		const base = lap * m.total;
		const a = Math.max(from, base) - base;
		const b = Math.min(to, base + m.total) - base;
		if (b < a) continue;
		if (out.length === 0) out.push(pointAt(m, a));
		for (let i = 0; i < m.at.length; i++) {
			if (m.at[i] > a && m.at[i] < b) out.push({ x: m.xs[i], y: m.ys[i] });
		}
		out.push(pointAt(m, b));
	}
	return out;
}

function polyline(points: Point[]): string {
	if (points.length === 0) return '';
	let d = `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
	for (let i = 1; i < points.length; i++)
		d += `L${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
	return d;
}

function flatten(cubics: Cubic[], steps = 16): Point[] {
	const points: Point[] = [{ x: cubics[0][0], y: cubics[0][1] }];
	for (const c of cubics) for (let s = 1; s <= steps; s++) points.push(pointOnCurve(c, s / steps));
	return points;
}

export type CircularSpec = {
	size: number;
	stroke: number;
	trackStroke: number;
	gap: number;
	wavelength: number;
};

/**
 * The two shapes `CircularShapes.update` builds: a circle and a nine-ish
 * point rounded star with the same vertex count, both normalised, turned to
 * start at 12 o'clock, scaled to the container less the stroke and centred,
 * as `pathFromCubics` and `processPath` do.
 */
export function circularShapes(spec: CircularSpec) {
	const r = spec.size / 2 - spec.stroke / 2;
	const n = Math.max(5, Math.round((2 * Math.PI * r) / spec.wavelength));

	const polygonRadius = 1 / Math.cos(Math.PI / n);
	const circle = normalized(
		roundedPolygon(
			Array.from({ length: n }, (_, i) => ({
				x: polygonRadius * Math.cos(((2 * Math.PI) / n) * i),
				y: polygonRadius * Math.sin(((2 * Math.PI) / n) * i)
			})),
			Array.from({ length: n }, () => ({ radius: 1, smoothing: 0 }))
		)
	);
	const starVertices: Point[] = [];
	const starRoundings: Rounding[] = [];
	for (let i = 0; i < n; i++) {
		starVertices.push({ x: Math.cos((Math.PI / n) * 2 * i), y: Math.sin((Math.PI / n) * 2 * i) });
		starRoundings.push({ radius: 0.35, smoothing: 0.4 });
		starVertices.push({
			x: 0.75 * Math.cos((Math.PI / n) * (2 * i + 1)),
			y: 0.75 * Math.sin((Math.PI / n) * (2 * i + 1))
		});
		starRoundings.push({ radius: 0.5, smoothing: 0 });
	}
	const star = normalized(roundedPolygon(starVertices, starRoundings));

	const place = (shape: ReturnType<typeof normalized>) => {
		const first = shape.cubics[0];
		// Turn the first point to 270°, straight up on a y-down screen.
		const turn =
			(3 * Math.PI) / 2 - Math.atan2(first[1] - shape.center.y, first[0] - shape.center.x);
		const cos = Math.cos(turn);
		const sin = Math.sin(turn);
		const scale = spec.size - spec.stroke;
		const points = flatten(shape.cubics).map((p) => ({
			x: (p.x * cos - p.y * sin) * scale,
			y: (p.x * sin + p.y * cos) * scale
		}));
		// Centre by the control-point bounds, as Android's Path.getBounds does.
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const c of shape.cubics) {
			for (let i = 0; i < 8; i += 2) {
				const x = (c[i] * cos - c[i + 1] * sin) * scale;
				const y = (c[i] * sin + c[i + 1] * cos) * scale;
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
			}
		}
		const dx = spec.size / 2 - (minX + maxX) / 2;
		const dy = spec.size / 2 - (minY + maxY) / 2;
		return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
	};

	const circlePoints = place(circle);
	const starPoints = place(star);
	const c = spec.size / 2;
	const circleRadius =
		circlePoints.reduce((sum, p) => sum + Math.hypot(p.x - c, p.y - c), 0) / circlePoints.length;

	return { n, circle: measure(circlePoints), star: measure(starPoints), starPoints, circleRadius };
}

export type CircularFrame = { active: string; track: string };

/**
 * `CircularProgressDrawingCache.updateDrawPaths`. Between amplitudes Compose
 * morphs circle into star; here the star is eased radially towards the
 * circle, which matches it at both ends.
 */
export function circularFrame(
	spec: CircularSpec,
	shapes: ReturnType<typeof circularShapes>,
	end: number,
	amplitude: number,
	waveOffset: number
): CircularFrame {
	const c = spec.size / 2;
	const progressPath =
		amplitude >= 1
			? shapes.star
			: amplitude <= 0
				? shapes.circle
				: measure(
						shapes.starPoints.map((p) => {
							const r = Math.hypot(p.x - c, p.y - c);
							const k = (shapes.circleRadius + (r - shapes.circleRadius) * amplitude) / r;
							return { x: c + (p.x - c) * k, y: c + (p.y - c) * k };
						})
					);

	const total = progressPath.total;
	const pStop = end * total;
	const cap = Math.max(spec.stroke / 2, spec.trackStroke / 2);
	const trackGap = Math.min(pStop, spec.gap);
	const insets = Math.min(pStop, cap);
	const spacing = insets * 2 + trackGap;

	// The wave moves by cutting the active arc from further round a doubled
	// path, then turning it back into place, so the ends stay put while the
	// wave inside them travels.
	const offset = Math.min(Math.max(waveOffset, 0), 1);
	const shift = offset * total;
	let active = segment(progressPath, shift, pStop + shift, true);
	const angle = ((-(offset * 360) % 360) * Math.PI) / 180;
	if (angle !== 0) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		active = active.map((p) => ({
			x: c + (p.x - c) * cos - (p.y - c) * sin,
			y: c + (p.x - c) * sin + (p.y - c) * cos
		}));
	}

	const trackTotal = shapes.circle.total;
	const track = segment(shapes.circle, end * trackTotal + spacing, trackTotal - spacing);

	return { active: polyline(active), track: polyline(track) };
}
