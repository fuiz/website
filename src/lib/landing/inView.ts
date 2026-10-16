import type { Attachment } from 'svelte/attachments';

/**
 * Calls `onChange` with whether the element is on screen, every time that
 * changes. Scenes use it to start their animation the first time they are seen
 * and to stop drawing while they are scrolled away.
 */
export function inView(onChange: (visible: boolean) => void, threshold = 0.3): Attachment {
	return (node) => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) onChange(entry.isIntersecting);
			},
			{ threshold }
		);
		observer.observe(node);
		return () => observer.disconnect();
	};
}
