<script>
	import '@oddbird/popover-polyfill';
	import '@fontsource/poppins/800.css';
	import '@fontsource/atkinson-hyperlegible';
	import 'tippy.js/dist/tippy.css';

	import { navigating } from '$app/state';
	import Loading from '$lib/feedback/Loading.svelte';
	import { onMount, untrack } from 'svelte';

	let { children } = $props();

	let mounting = $state(true);
	let navigatingBoolean = $derived(navigating.type !== null);

	/**
	 * Starts a timer that will call the provided function after the specified milliseconds.
	 * Returns a function that can be called to clear the timer before it executes.
	 * @param {() => void} f The callback function to execute after the timer expires.
	 * @param {number} ms The delay in milliseconds before the callback is executed.
	 */
	const startTimer = (f, ms) => {
		let timer = setTimeout(f, ms);
		return () => {
			clearTimeout(timer);
		};
	};

	let longNavigating = $state(false);

	let stopTimer = $state(() => {
		// left empty for a reason
	});

	$effect(() => {
		if (navigatingBoolean) {
			untrack(() => {
				stopTimer = startTimer(() => {
					longNavigating = true;
				}, 100);
			});
		} else {
			untrack(() => {
				stopTimer();
				longNavigating = false;
			});
		}
	});

	onMount(() => {
		mounting = false;
	});
</script>

{#if mounting || longNavigating}
	<Loading />
{:else}
	{@render children?.()}
{/if}

<style>
	:root {
		--background-color: #fffbf5;
		--color: #241f31;
		--palette-light: #fffbf5;
		--palette-dark: #241f31;
		--accent-color: #d4131b;

		@media (prefers-color-scheme: dark) {
			--background-color: #241f31;
			--color: #fffbf5;
		}
	}

	:global(html[data-theme='light']) {
		--background-color: #fffbf5;
		--color: #241f31;
	}

	:global(html[data-theme='dark']) {
		--background-color: #241f31;
		--color: #fffbf5;
	}

	:global(body) {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 32px;
		color: var(--color);
	}

	:global(html) {
		background: var(--background-color);
	}

	:global(.tippy-box[data-theme~='fuiz']) {
		background-color: var(--background-color);
		border: 3px solid;
		border-radius: 0.7em;
		padding: 0em 0.4em;
		font-size: inherit;
		color: inherit;
	}
</style>
