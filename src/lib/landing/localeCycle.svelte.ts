import type { Attachment } from 'svelte/attachments';
import { prefersReducedMotion } from 'svelte/motion';
import * as m from '$lib/paraglide/messages.js';
import { getLocale, type Locale, locales } from '$lib/paraglide/runtime';

/** The section's title in every language Fuiz ships in. */
export const texts = locales.map((locale) => ({
	locale,
	title: m.well_translated({}, { locale })
}));

/**
 * Which language a section is showing: it steps through them all while the
 * section is on screen, and holds on one while it's pointed at or focused.
 */
export class LocaleCycle {
	cycling = $state<Locale>(getLocale());
	pointed = $state<Locale>();
	shown = $derived(this.pointed ?? this.cycling);
	ms: number;

	constructor(ms = 2600) {
		this.ms = ms;
	}

	/** Attach to the section to cycle only while it's in view. */
	run: Attachment = (node) => {
		let timer: ReturnType<typeof setInterval> | undefined;
		const observer = new IntersectionObserver(
			([entry]) => {
				clearInterval(timer);
				if (!entry.isIntersecting || prefersReducedMotion.current) return;
				timer = setInterval(() => {
					if (this.pointed === undefined) this.next();
				}, this.ms);
			},
			{ threshold: 0.3 }
		);
		observer.observe(node);
		return () => {
			observer.disconnect();
			clearInterval(timer);
		};
	};

	next() {
		this.cycling = locales[(locales.indexOf(this.cycling) + 1) % locales.length];
	}

	point(locale: Locale | undefined) {
		this.pointed = locale;
	}

	/** Handlers that preview `locale` while it's pointed at or focused. */
	preview(locale: Locale) {
		return {
			onpointerenter: () => this.point(locale),
			onpointerleave: () => this.point(undefined),
			onfocus: () => this.point(locale),
			onblur: () => this.point(undefined)
		};
	}
}
