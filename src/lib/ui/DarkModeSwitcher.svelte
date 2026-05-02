<script lang="ts">
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages.js';
	import StatedIconButton from '$lib/ui/StatedIconButton.svelte';
	import DarkModeOutline from '~icons/material-symbols/dark-mode-outline';
	import LightModeOutline from '~icons/material-symbols/light-mode-outline';

	let { dark = $bindable(undefined) }: { dark?: boolean | undefined } = $props();

	function getName(state: boolean): string {
		return state ? 'dark' : 'light';
	}

	if (browser && dark === undefined) {
		dark = (localStorage.getItem('theme') ?? 'light') === 'dark';
	}

	$effect.pre(() => {
		if (browser && dark !== undefined) {
			localStorage.setItem('theme', getName(dark));
			document.documentElement.setAttribute('data-theme', getName(dark));
		}
	});
</script>

{#if dark !== undefined}
	<StatedIconButton
		icons={[
			{ component: LightModeOutline, alt: m.switch_dark() },
			{ component: DarkModeOutline, alt: m.switch_light() }
		]}
		bind:state={dark}
	/>
{/if}
