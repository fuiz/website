import type { Action } from 'svelte/action';

export type LongPressOptions = {
	onlongpress: () => void;
	/** How long the finger must stay down, in milliseconds. */
	duration?: number;
};

/** Sliding this far mid-press means the user is scrolling, not holding. */
const MOVE_TOLERANCE_PX = 10;
const DEFAULT_DURATION_MS = 500;

/**
 * Fires `onlongpress` when a finger is held still on the node.
 *
 * Touch only, because a long mouse press is not a gesture anyone expects, and on desktop the
 * checkbox is already visible on hover. The press ends in a `click`, and on a link that
 * would navigate away from the selection the user just made, so the click is swallowed in
 * the capture phase; the platform's own long-press menu is suppressed for the same reason.
 */
export const longPress: Action<HTMLElement, LongPressOptions> = (node, options) => {
	let opts = options;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let fired = false;
	let startX = 0;
	let startY = 0;

	function cancel() {
		clearTimeout(timer);
		timer = undefined;
	}

	function onpointerdown(event: PointerEvent) {
		fired = false;
		if (event.pointerType !== 'touch') return;

		startX = event.clientX;
		startY = event.clientY;
		timer = setTimeout(() => {
			timer = undefined;
			fired = true;
			if ('vibrate' in navigator) navigator.vibrate(10);
			opts.onlongpress();
		}, opts.duration ?? DEFAULT_DURATION_MS);
	}

	function onpointermove(event: PointerEvent) {
		if (timer === undefined) return;
		if (Math.hypot(event.clientX - startX, event.clientY - startY) > MOVE_TOLERANCE_PX) cancel();
	}

	function onclick(event: MouseEvent) {
		if (!fired) return;
		fired = false;
		event.preventDefault();
		event.stopPropagation();
	}

	function oncontextmenu(event: Event) {
		if (timer !== undefined || fired) event.preventDefault();
	}

	node.addEventListener('pointerdown', onpointerdown);
	node.addEventListener('pointermove', onpointermove);
	node.addEventListener('pointerup', cancel);
	node.addEventListener('pointercancel', cancel);
	node.addEventListener('pointerleave', cancel);
	node.addEventListener('click', onclick, true);
	node.addEventListener('contextmenu', oncontextmenu);

	return {
		update(next: LongPressOptions) {
			opts = next;
		},
		destroy() {
			cancel();
			node.removeEventListener('pointerdown', onpointerdown);
			node.removeEventListener('pointermove', onpointermove);
			node.removeEventListener('pointerup', cancel);
			node.removeEventListener('pointercancel', cancel);
			node.removeEventListener('pointerleave', cancel);
			node.removeEventListener('click', onclick, true);
			node.removeEventListener('contextmenu', oncontextmenu);
		}
	};
};
