<script lang="ts">
	import '@oddbird/popover-polyfill';
	import '@fontsource/poppins/800.css';
	import '@fontsource-variable/atkinson-hyperlegible-next';
	import '@fontsource-variable/noto-sans';
	import '@fontsource-variable/noto-sans-arabic';

	import { onMount, type Snippet, untrack } from 'svelte';
	import { navigating, page } from '$app/state';
	import Loading from '$lib/feedback/Loading.svelte';

	let { children }: { children?: Snippet } = $props();

	let mounting = $state(true);
	let navigatingBoolean = $derived(navigating.type !== null);

	/**
	 * Starts a timer that will call the provided function after the specified milliseconds.
	 * Returns a function that can be called to clear the timer before it executes.
	 */
	const startTimer = (f: () => void, ms: number) => {
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
		--outline: color-mix(in srgb, var(--on-surface) 25%, transparent);

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

		/* fixed light/dark values (not theme-responsive) */
		--palette-light: #fffbf5;
		--palette-dark: #241f31;

		/* answer-button palette (8 colors, paired bg + deep) */
		--btn-bg-0: hsl(358, 84%, 45%);
		--btn-deep-0: hsl(358, 84%, 35%);
		--btn-bg-1: hsl(205, 84%, 30%);
		--btn-deep-1: hsl(205, 84%, 20%);
		--btn-bg-2: hsl(120, 83%, 18%);
		--btn-deep-2: hsl(120, 83%, 8%);
		--btn-bg-3: hsl(25, 84%, 48%);
		--btn-deep-3: hsl(25, 84%, 38%);
		--btn-bg-4: hsl(318, 84%, 25%);
		--btn-deep-4: hsl(318, 84%, 15%);
		--btn-bg-5: hsl(179, 84%, 32%);
		--btn-deep-5: hsl(179, 84%, 22%);
		--btn-bg-6: hsl(69, 84%, 40%);
		--btn-deep-6: hsl(69, 84%, 30%);
		--btn-bg-7: hsl(0, 0%, 20%);
		--btn-deep-7: hsl(0, 0%, 10%);

		@media (prefers-color-scheme: dark) {
			--surface: #241f31;
			--on-surface: #fffbf5;
			--surface-variant: #3d3849;
			--on-surface-variant: #c9c4bf;
			--outline: color-mix(in srgb, var(--on-surface) 25%, transparent);

			--primary: #d4131b;
			--on-primary: #ffffff;
			--primary-container: #930009;
			--on-primary-container: #ffdad6;

			--secondary: #4a5078;
			--on-secondary: #ffffff;
			--secondary-container: #3e4560;
			--on-secondary-container: #dde1ff;

			--tertiary: #78736d;
			--on-tertiary: #ffffff;
			--tertiary-container: #4b4641;
			--on-tertiary-container: #e8e0d8;
		}
	}

	:global(html[data-theme='light']) {
		--surface: #fffbf5;
		--on-surface: #241f31;
		--surface-variant: #ede7df;
		--on-surface-variant: #4d4843;
		--outline: color-mix(in srgb, var(--on-surface) 25%, transparent);

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
		--outline: color-mix(in srgb, var(--on-surface) 25%, transparent);

		--primary: #d4131b;
		--on-primary: #ffffff;
		--primary-container: #930009;
		--on-primary-container: #ffdad6;

		--secondary: #4a5078;
		--on-secondary: #ffffff;
		--secondary-container: #3e4560;
		--on-secondary-container: #dde1ff;

		--tertiary: #78736d;
		--on-tertiary: #ffffff;
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
		color: var(--on-surface);
	}

	:global(html) {
		background: var(--surface);
	}

	:global(.palette-0) {
		--btn-bg: var(--btn-bg-0);
		--btn-deep: var(--btn-deep-0);
	}
	:global(.palette-1) {
		--btn-bg: var(--btn-bg-1);
		--btn-deep: var(--btn-deep-1);
	}
	:global(.palette-2) {
		--btn-bg: var(--btn-bg-2);
		--btn-deep: var(--btn-deep-2);
	}
	:global(.palette-3) {
		--btn-bg: var(--btn-bg-3);
		--btn-deep: var(--btn-deep-3);
	}
	:global(.palette-4) {
		--btn-bg: var(--btn-bg-4);
		--btn-deep: var(--btn-deep-4);
	}
	:global(.palette-5) {
		--btn-bg: var(--btn-bg-5);
		--btn-deep: var(--btn-deep-5);
	}
	:global(.palette-6) {
		--btn-bg: var(--btn-bg-6);
		--btn-deep: var(--btn-deep-6);
	}
	:global(.palette-7) {
		--btn-bg: var(--btn-bg-7);
		--btn-deep: var(--btn-deep-7);
	}

	/* named (non-numbered) palettes for CTAs that aren't part of the 8-color answer set */
	:global(.palette-secondary) {
		--btn-bg: var(--secondary);
		--btn-deep: color-mix(in srgb, var(--secondary) 80%, black);
		--btn-fg: var(--on-secondary);
	}
	:global(.palette-tertiary) {
		--btn-bg: var(--tertiary);
		--btn-deep: color-mix(in srgb, var(--tertiary) 80%, black);
		--btn-fg: var(--on-tertiary);
	}
	:global(.palette-gitlab) {
		--btn-bg: #fc6d26;
		--btn-deep: #e24329;
		--btn-fg: #ffffff;
	}
	:global(.palette-ghost) {
		--btn-bg: var(--surface);
		--btn-deep: currentcolor;
		--btn-fg: currentcolor;
	}

	:global([popover].fuiz-popover) {
		background-color: var(--surface);
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		padding: 0.4em 0.7em;
		font-size: inherit;
		color: inherit;
		margin: 0;
		inset: auto;
		position-area: top;
		box-shadow:
			0 1px 2px color-mix(in srgb, var(--on-surface) 8%, transparent),
			0 4px 12px color-mix(in srgb, var(--on-surface) 12%, transparent);
	}
</style>
