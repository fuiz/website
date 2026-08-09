<script lang="ts">
	import { getImageInfo } from '$lib/media/imageInfo';
	import MediaFallback from '$lib/media/MediaFallback.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { isPinOnTarget } from '$lib/question-types/pin/shared/correctness';
	import type { Media, PinPoint, PinShape, PinTool } from '$lib/types';
	import LocationOn from '~icons/material-symbols/location-on';

	/**
	 * The pinnable image, shared by the editor (drawing the correct area), the
	 * player (dropping a pin) and the host (showing where everyone pinned).
	 *
	 * Everything is positioned in the image's own normalised `0..1` space, so the
	 * same coordinates render identically on a phone and a projector. The target
	 * is drawn into an SVG overlay with `viewBox="0 0 1 1"`, which maps that space
	 * onto the picture exactly, with no aspect-ratio bookkeeping anywhere.
	 */
	let {
		media,
		pins = [],
		shape = undefined,
		myPin = undefined,
		interactive = false,
		showShape = false,
		tool = undefined,
		onpick,
		ondraw
	}: {
		media: Media | undefined;
		/** Everyone else's pins, drawn as translucent dots. */
		pins?: PinPoint[];
		/** The region that earns points, when the slide has one. */
		shape?: PinShape | undefined;
		/** This viewer's own pin, drawn prominently. */
		myPin?: PinPoint | undefined;
		/** Whether tapping the image places `myPin`. */
		interactive?: boolean;
		/** Whether to reveal the target. */
		showShape?: boolean;
		/** When set, dragging on the image draws a new target of this kind. */
		tool?: PinTool | undefined;
		onpick?: (point: PinPoint) => void;
		ondraw?: (shape: PinShape) => void;
	} = $props();

	let info = $derived(media ? getImageInfo(media) : undefined);

	// The rendered box, so a pointer position in client pixels becomes a
	// normalised point.
	let frame = $state<HTMLElement>();

	/**
	 * The frame is sized to the largest box of the picture's shape that fits the
	 * board, which is what lets the SVG overlay sit exactly on it.
	 *
	 * CSS alone can't do this here. `max-height: 100%` on the image resolves
	 * against the frame, whose height comes from the image, so the browser treats
	 * it as `none` and `overflow: hidden` crops the picture. `aspect-ratio` on
	 * the frame doesn't help either: a clamped height never feeds back into an
	 * explicit width, so the box just goes out of shape.
	 */
	let board = $state<HTMLElement>();
	let boardBox = $state({ width: 0, height: 0 });
	let imageEl = $state<HTMLImageElement>();
	let natural = $state({ width: 0, height: 0 });

	$effect(() => {
		const element = board;
		if (!element) return;
		// Read once up front: a ResizeObserver only reports on a later frame, and
		// a backgrounded tab may not be given one for a long time.
		const box = element.getBoundingClientRect();
		boardBox = { width: box.width, height: box.height };

		const observer = new ResizeObserver(([entry]) => {
			boardBox = { width: entry.contentRect.width, height: entry.contentRect.height };
		});
		observer.observe(element);
		return () => observer.disconnect();
	});

	$effect(() => {
		// A data URL decodes synchronously, so the element is often `complete`
		// before `load` could ever fire, so read it directly and let the event
		// handler cover pictures that are still downloading.
		const source = info?.src;
		const image = imageEl;
		if (!image) return;
		if (image.currentSrc && image.currentSrc !== source) natural = { width: 0, height: 0 };
		measure(image);
	});

	function measure(image: HTMLImageElement | undefined) {
		if (image?.naturalWidth) {
			natural = { width: image.naturalWidth, height: image.naturalHeight };
		}
	}

	/** `undefined` until both boxes are known; the image sizes itself until then. */
	let fitted = $derived.by(() => {
		if (natural.width <= 0 || natural.height <= 0 || boardBox.width <= 0) return undefined;
		// A parent that hasn't committed to a height only constrains the width.
		const scale =
			boardBox.height > 0
				? Math.min(boardBox.width / natural.width, boardBox.height / natural.height)
				: boardBox.width / natural.width;
		return { width: natural.width * scale, height: natural.height * scale };
	});

	// The shape being dragged out right now, previewed until the pointer lifts.
	let draft = $state<PinShape | undefined>(undefined);
	let dragStart: PinPoint | undefined;

	let drawing = $derived(tool !== undefined);
	let visibleShape = $derived(draft ?? (showShape ? shape : undefined));

	function pointFrom(clientX: number, clientY: number): PinPoint | undefined {
		const rect = frame?.getBoundingClientRect();
		if (!rect || rect.width === 0 || rect.height === 0) return undefined;
		return {
			x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
			y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
		};
	}

	/** Builds the shape spanning `from`..`to` for the active tool. */
	function shapeBetween(from: PinPoint, to: PinPoint): PinShape {
		if (tool === 'Rectangle') {
			return {
				Rectangle: { x: from.x, y: from.y, width: to.x - from.x, height: to.y - from.y }
			};
		}
		return {
			Ellipse: {
				center: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
				radius_x: Math.abs(to.x - from.x) / 2,
				radius_y: Math.abs(to.y - from.y) / 2
			}
		};
	}

	// A trace samples the pointer densely; keeping every sample would ship
	// thousands of points, so only meaningful movement is recorded.
	const TRACE_SPACING = 0.012;

	function extendTrace(point: PinPoint) {
		if (draft && 'Polygon' in draft) {
			const points = draft.Polygon.points;
			const last = points[points.length - 1];
			const far = Math.hypot(point.x - last.x, point.y - last.y) >= TRACE_SPACING;
			if (far) draft = { Polygon: { points: [...points, point] } };
		} else {
			draft = { Polygon: { points: [point] } };
		}
	}

	function handlePointerDown(event: PointerEvent) {
		if (drawing) {
			const point = pointFrom(event.clientX, event.clientY);
			if (!point) return;
			event.preventDefault();
			// Capture keeps the drag alive when the pointer leaves the picture.
			// Some browsers reject a capture request for a pointer they no longer
			// consider active; the drag still works without it.
			try {
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
			} catch {
				/* drawing continues via the element's own move events */
			}
			dragStart = point;
			draft = tool === 'Polygon' ? { Polygon: { points: [point] } } : shapeBetween(point, point);
			return;
		}
		if (interactive) {
			const point = pointFrom(event.clientX, event.clientY);
			if (point) onpick?.(point);
		}
	}

	function handlePointerMove(event: PointerEvent) {
		if (!drawing || !dragStart) return;
		const point = pointFrom(event.clientX, event.clientY);
		if (!point) return;
		if (tool === 'Polygon') {
			extendTrace(point);
		} else {
			draft = shapeBetween(dragStart, point);
		}
	}

	function handlePointerUp() {
		if (!drawing || !dragStart) return;
		dragStart = undefined;
		const finished = draft;
		draft = undefined;
		// A tap rather than a drag leaves nothing worth keeping.
		if (finished && !isEmpty(finished)) ondraw?.(finished);
	}

	function isEmpty(candidate: PinShape): boolean {
		if ('Rectangle' in candidate) {
			return (
				Math.abs(candidate.Rectangle.width) < 0.01 || Math.abs(candidate.Rectangle.height) < 0.01
			);
		}
		if ('Ellipse' in candidate) {
			return candidate.Ellipse.radius_x < 0.005 || candidate.Ellipse.radius_y < 0.005;
		}
		return candidate.Polygon.points.length < 3;
	}

	// Keyboard users nudge a pin around the board rather than tapping it.
	const NUDGE = 0.02;

	function handleKeydown(event: KeyboardEvent) {
		if (!interactive) return;
		const current = myPin ?? { x: 0.5, y: 0.5 };
		const moves: Record<string, PinPoint> = {
			ArrowLeft: { x: current.x - NUDGE, y: current.y },
			ArrowRight: { x: current.x + NUDGE, y: current.y },
			ArrowUp: { x: current.x, y: current.y - NUDGE },
			ArrowDown: { x: current.x, y: current.y + NUDGE }
		};
		const next = moves[event.key];
		if (next) {
			event.preventDefault();
			onpick?.({ x: Math.min(1, Math.max(0, next.x)), y: Math.min(1, Math.max(0, next.y)) });
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onpick?.(current);
		}
	}

	// Once the target is revealed, a pin that scored should say so. Reusing the
	// same hit test the server scores with means the picture can never disagree
	// with the tally beside it.
	let scored = $derived(
		showShape && shape !== undefined ? (pin: PinPoint) => isPinOnTarget(pin, shape) : undefined
	);

	let polygonPoints = $derived(
		visibleShape && 'Polygon' in visibleShape
			? visibleShape.Polygon.points.map((p) => `${p.x},${p.y}`).join(' ')
			: ''
	);
</script>

<div class="board" bind:this={board}>
	{#if info}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			bind:this={frame}
			class="frame"
			class:interactive
			class:drawing
			class:measured={fitted !== undefined}
			role={interactive ? 'application' : 'img'}
			aria-label={interactive ? m.pin_place_hint() : info.alt}
			tabindex={interactive ? 0 : undefined}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
			onkeydown={handleKeydown}
			style:width={fitted ? `${fitted.width}px` : undefined}
			style:height={fitted ? `${fitted.height}px` : undefined}
		>
			<img
				bind:this={imageEl}
				src={info.src}
				alt={info.alt}
				draggable="false"
				onload={() => measure(imageEl)}
			/>

			{#if visibleShape}
				<!-- The viewBox is the normalised space itself, so no conversion is
				     needed and the outline never distorts with the image. -->
				<svg class="overlay" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
					{#if 'Rectangle' in visibleShape}
						{@const r = visibleShape.Rectangle}
						<rect
							x={Math.min(r.x, r.x + r.width)}
							y={Math.min(r.y, r.y + r.height)}
							width={Math.abs(r.width)}
							height={Math.abs(r.height)}
							vector-effect="non-scaling-stroke"
						/>
					{:else if 'Ellipse' in visibleShape}
						{@const e = visibleShape.Ellipse}
						<ellipse
							cx={e.center.x}
							cy={e.center.y}
							rx={e.radius_x}
							ry={e.radius_y}
							vector-effect="non-scaling-stroke"
						/>
					{:else}
						<polygon points={polygonPoints} vector-effect="non-scaling-stroke" />
					{/if}
				</svg>
			{/if}

			{#each pins as pin, i (i)}
				<span
					class="dot"
					class:on-target={scored?.(pin) === true}
					class:missed={scored?.(pin) === false}
					style:--x="{pin.x * 100}%"
					style:--y="{pin.y * 100}%"
				></span>
			{/each}

			{#if myPin}
				<span class="mine" style:--x="{myPin.x * 100}%" style:--y="{myPin.y * 100}%">
					<LocationOn height="1em" width="1em" title={m.your_pin()} />
				</span>
			{/if}
		</div>
	{:else}
		<MediaFallback />
	{/if}
</div>

<style>
	.board {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
	}

	.frame {
		position: relative;
		display: inline-block;
		max-height: 100%;
		max-width: 100%;
		line-height: 0;
		border-radius: 0.5em;
		overflow: hidden;
		touch-action: none;
	}

	/* Once both boxes are known the frame *is* the picture, at the size that
	   fits, so the overlay lines up and nothing is cropped. */
	.frame.measured {
		display: block;
	}

	.frame.interactive,
	.frame.drawing {
		cursor: crosshair;
	}

	.frame.interactive:focus-visible {
		outline: 3px solid var(--primary);
		outline-offset: 2px;
	}

	img {
		display: block;
		/* Before measurement the picture sizes the frame around itself. */
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		user-select: none;
		-webkit-user-drag: none;
	}

	/* Afterwards the frame is already the picture's shape, so filling it neither
	   crops nor letterboxes. */
	.frame.measured img {
		width: 100%;
		height: 100%;
	}

	.overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		/* A soft white halo, so the outline stays legible wherever it lands;
		   a bare coloured line disappears against a photo of a similar hue.
		   Applied to the whole overlay rather than per-shape so it survives the
		   viewBox's non-uniform scale. */
		filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.9))
			drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
	}

	.overlay :global(rect),
	.overlay :global(ellipse),
	.overlay :global(polygon) {
		fill: color-mix(in srgb, var(--primary) 25%, transparent);
		stroke: var(--primary);
		stroke-width: 3px;
		stroke-linejoin: round;
	}

	/* A marker, not a dot: a spot on a picture is something you point at, and the
	   teardrop says which exact pixel was meant. Same construction as the pin
	   slide's announcement glyph: a square with one square corner, turned so
	   that corner points down.
	   `translate`/`rotate` rather than `transform`, so the 0.5 + sqrt(2)/2 lift that
	   lands the point on the spot survives anything animating `transform`. */
	.dot {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: 1.1em;
		height: 1.1em;
		translate: -50% -120.7%;
		rotate: -45deg;
		border-radius: 50% 50% 50% 0;
		background: color-mix(in srgb, var(--on-surface) 65%, transparent);
		border: 0.1em solid rgba(255, 255, 255, 0.9);
		box-sizing: border-box;
		box-shadow: 0 0.1em 0.2em rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}

	.dot::after {
		content: '';
		position: absolute;
		inset: 28%;
		border-radius: 50%;
		background: var(--surface);
	}

	/* A pin that scored takes the answer's colour and sits above the rest; one
	   that missed steps back, the same way a wrong answer fades in the
	   multiple-choice statistics. */
	.dot.on-target {
		background: var(--correct);
		width: 1.35em;
		height: 1.35em;
		z-index: 1;
	}

	.dot.missed {
		background: color-mix(in srgb, var(--on-surface) 45%, transparent);
		opacity: 0.55;
	}

	.mine {
		position: absolute;
		left: var(--x);
		top: var(--y);
		/* The teardrop marker points at its tip, not its middle. */
		transform: translate(-50%, -100%);
		font-size: 2.2em;
		color: var(--primary);
		filter: drop-shadow(0 0.06em 0.08em rgba(0, 0, 0, 0.45));
		pointer-events: none;
	}
</style>
