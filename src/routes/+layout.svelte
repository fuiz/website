<script>
	import '@oddbird/popover-polyfill';
	import '@fontsource/poppins/800.css';
	import '@fontsource-variable/atkinson-hyperlegible-next';
	import '@fontsource-variable/noto-sans';
	import '@fontsource-variable/noto-sans-arabic';

	import { onMount, untrack } from 'svelte';
	import { navigating, page } from '$app/state';
	import Loading from '$lib/feedback/Loading.svelte';

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
		// load interestfor polyfill on the client
		import('interestfor');
	});
</script>

<svelte:head>
	<meta property="og:url" content={page.url.origin} />
</svelte:head>

{#if mounting || longNavigating}
	<Loading />
{:else}
	{@render children?.()}
{/if}

<style>
	:root {
		/* surface */
		--surface: #fffbf5;
		--on-surface: #241f31;
		--surface-variant: #ede7df;
		--on-surface-variant: #4d4843;
		--outline: #7f7a74;

		/* primary (brand red) */
		--primary: #d4131b;
		--on-primary: #ffffff;
		--primary-container: #ffdad6;
		--on-primary-container: #410002;

		/* secondary (indigo) */
		--secondary: #4a5078;
		--on-secondary: #ffffff;
		--secondary-container: #dde1ff;
		--on-secondary-container: #141b42;

		/* tertiary (warm gray) */
		--tertiary: #78736d;
		--on-tertiary: #ffffff;
		--tertiary-container: #e8e0d8;
		--on-tertiary-container: #2e2a25;

		/* legacy aliases */
		--background-color: var(--surface);
		--color: var(--on-surface);
		--palette-light: #fffbf5;
		--palette-dark: #241f31;
		--accent-color: var(--primary);

		@media (prefers-color-scheme: dark) {
			--surface: #241f31;
			--on-surface: #fffbf5;
			--surface-variant: #3d3849;
			--on-surface-variant: #c9c4bf;
			--outline: #938e89;

			--primary: #ffb4ab;
			--on-primary: #690005;
			--primary-container: #930009;
			--on-primary-container: #ffdad6;

			--secondary: #bec2e8;
			--on-secondary: #282f54;
			--secondary-container: #3e4560;
			--on-secondary-container: #dde1ff;

			--tertiary: #cdc5bc;
			--on-tertiary: #342f2a;
			--tertiary-container: #4b4641;
			--on-tertiary-container: #e8e0d8;
		}
	}

	:global(html[data-theme='light']) {
		--surface: #fffbf5;
		--on-surface: #241f31;
		--surface-variant: #ede7df;
		--on-surface-variant: #4d4843;
		--outline: #7f7a74;

		--primary: #d4131b;
		--on-primary: #ffffff;
		--primary-container: #ffdad6;
		--on-primary-container: #410002;

		--secondary: #4a5078;
		--on-secondary: #ffffff;
		--secondary-container: #dde1ff;
		--on-secondary-container: #141b42;

		--tertiary: #78736d;
		--on-tertiary: #ffffff;
		--tertiary-container: #e8e0d8;
		--on-tertiary-container: #2e2a25;

		color-scheme: light;
	}

	:global(html[data-theme='dark']) {
		--surface: #241f31;
		--on-surface: #fffbf5;
		--surface-variant: #3d3849;
		--on-surface-variant: #c9c4bf;
		--outline: #938e89;

		--primary: #ffb4ab;
		--on-primary: #690005;
		--primary-container: #930009;
		--on-primary-container: #ffdad6;

		--secondary: #bec2e8;
		--on-secondary: #282f54;
		--secondary-container: #3e4560;
		--on-secondary-container: #dde1ff;

		--tertiary: #cdc5bc;
		--on-tertiary: #342f2a;
		--tertiary-container: #4b4641;
		--on-tertiary-container: #e8e0d8;

		color-scheme: dark;
	}

	@font-face {
		font-family: 'Atkinson Hyperlegible Next Variable Fallback';
		src: local('Arial');
		ascent-override: 95%;
		descent-override: 29%;
		line-gap-override: 0%;
	}

	:global(body) {
		font-family: 'Atkinson Hyperlegible Next Variable', 'Noto Sans Variable', 'Noto Sans Arabic Variable', 'Atkinson Hyperlegible Next Variable Fallback', sans-serif;
		--alternative-font: 'Poppins', 'Atkinson Hyperlegible Next Variable', 'Noto Sans Variable', 'Noto Sans Arabic Variable', 'Atkinson Hyperlegible Next Variable Fallback', sans-serif;
		font-size: 20px;
		color: var(--color);
	}

	:global(html) {
		background: var(--background-color);
	}

	:global([popover].fuiz-popover) {
		background-color: var(--background-color);
		border: 3px solid;
		border-radius: 0.7em;
		padding: 0em 0.4em;
		font-size: inherit;
		color: inherit;
		margin: 0;
		inset: auto;
		position-area: top;
	}
</style>
