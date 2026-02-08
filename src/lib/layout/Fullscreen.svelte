<script>
	import * as m from '$lib/paraglide/messages.js';

	import OpenInFull from '~icons/material-symbols/open-in-full';
	import CloseFullscreen from '~icons/material-symbols/close-fullscreen';
	import { onMount } from 'svelte';
	import IconButton from '$lib/ui/IconButton.svelte';

	let fullscreen = $state(false);

	/** @type {{ fullscreenElement?: HTMLElement | undefined }}*/
	let { fullscreenElement = undefined } = $props();

	onMount(() => {
		document.addEventListener('fullscreenchange', () => {
			fullscreen = document.fullscreenElement !== null;
		});

		fullscreen = document.fullscreenElement !== null;
	});

	async function toggle() {
		if (fullscreen) {
			await document.exitFullscreen();
		} else {
			await (fullscreenElement || document.documentElement).requestFullscreen();
		}
	}
</script>

<IconButton onclick={toggle} alt={fullscreen ? m.exit_fullscreen() : m.enter_fullscreen()}>
	{#if fullscreen}
		<CloseFullscreen height="1em" />
	{:else}
		<OpenInFull height="1em" />
	{/if}
</IconButton>
