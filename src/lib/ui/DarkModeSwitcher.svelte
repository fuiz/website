<script>
	import * as m from '$lib/paraglide/messages.js';

	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import DarkModeOutline from '~icons/material-symbols/dark-mode-outline';
	import LightModeOutline from '~icons/material-symbols/light-mode-outline';
	import { browser } from '$app/environment';

	/**
	 * @param {boolean} state
	 * @returns {string}
	 */
	function getName(state) {
		return state ? 'dark' : 'light';
	}

	/** @type {boolean | undefined} */
	let theme = $state(browser ? (localStorage.getItem('theme') ?? 'light') === 'dark' : undefined);

	$effect.pre(() => {
		if (browser && theme !== undefined) {
			localStorage.setItem('theme', getName(theme));
			document.documentElement.setAttribute('data-theme', getName(theme));
		}
	});
</script>

{#if theme !== undefined}
	<StatedIconButton
		icons={[
			{ component: LightModeOutline, alt: m.switch_dark() },
			{ component: DarkModeOutline, alt: m.switch_light() }
		]}
		bind:state={theme}
		size="1em"
	/>
{/if}
