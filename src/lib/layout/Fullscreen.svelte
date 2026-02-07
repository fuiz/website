<script>
	import * as m from '$lib/paraglide/messages.js';

	import fullscreenEnter from '$lib/assets/icons/fullscreen_enter.svg';
	import fullscreenExit from '$lib/assets/icons/fullscreen_exit.svg';
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

<IconButton
	onclick={toggle}
	src={fullscreen ? fullscreenExit : fullscreenEnter}
	alt={fullscreen ? m.exit_fullscreen() : m.enter_fullscreen()}
	size="1em"
/>
