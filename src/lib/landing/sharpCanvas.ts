/**
 * Keeps a canvas's drawing buffer exactly as many device pixels as it covers
 * on screen, so what's drawn on it stays sharp, and calls `redraw` whenever
 * that changes, including when the page is zoomed.
 *
 * Sizing it from the CSS width times the pixel ratio, rounded, leaves it a
 * fraction of a pixel off whenever the layout lands between pixels, and the
 * browser then stretches the bitmap to fit, which blurs it. The browser's own
 * device-pixel size of the box avoids that. Returns a function that stops
 * watching.
 */
export function sharpCanvas(canvas: HTMLCanvasElement, redraw: () => void): () => void {
	// A first size straight away from the measured box, so there is something
	// to draw on before the browser reports the exact one.
	const box = canvas.getBoundingClientRect();
	const ratio = window.devicePixelRatio || 1;
	canvas.width = Math.round(box.width * ratio);
	canvas.height = Math.round(box.height * ratio);
	redraw();

	const observer = new ResizeObserver(([entry]) => {
		const device = entry.devicePixelContentBoxSize?.[0];
		if (device) {
			canvas.width = device.inlineSize;
			canvas.height = device.blockSize;
		} else {
			const ratio = window.devicePixelRatio || 1;
			canvas.width = Math.round(entry.contentRect.width * ratio);
			canvas.height = Math.round(entry.contentRect.height * ratio);
		}
		redraw();
	});
	try {
		observer.observe(canvas, { box: 'device-pixel-content-box' });
	} catch {
		// Browsers without device-pixel boxes fall back to the content box.
		observer.observe(canvas);
	}
	return () => observer.disconnect();
}
