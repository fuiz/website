import { MediaQuery } from 'svelte/reactivity';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

const prefersDark = new MediaQuery('(prefers-color-scheme: dark)', false);

function devicePreference(): Theme {
	return prefersDark.current ? 'dark' : 'light';
}

function storedOverride(): Theme | undefined {
	const stored = localStorage.getItem('theme');
	return stored === 'dark' || stored === 'light' ? stored : undefined;
}

/**
 * Set only while the user wants something other than what their device asks for.
 * `undefined` means "follow the device": no `data-theme` attribute, so the
 * `prefers-color-scheme` rules apply and keep tracking the device on their own.
 */
let override = $state<Theme | undefined>(undefined);

function apply() {
	if (override === undefined) {
		localStorage.removeItem('theme');
		document.documentElement.removeAttribute('data-theme');
	} else {
		localStorage.setItem('theme', override);
		document.documentElement.setAttribute('data-theme', override);
	}
}

if (browser) {
	const stored = storedOverride();
	// A stored choice matching the device is indistinguishable from following it,
	// and would pin the theme if the device preference changed later.
	override = stored === devicePreference() ? undefined : stored;
	apply();
}

export const theme = {
	get current(): Theme {
		return override ?? devicePreference();
	},
	set current(next: Theme) {
		override = next === devicePreference() ? undefined : next;
		apply();
	}
};
