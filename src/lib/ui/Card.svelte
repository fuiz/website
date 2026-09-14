<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	/**
	 * A card with a background color instead of a border.
	 *
	 * Use `level="default"` on a page and `level="high"` inside a dialog or another card.
	 *
	 * Renders an `<a>` if `href` is set, a `<button>` if `onclick` is set, otherwise a
	 * `<div>`.
	 *
	 * To style the card itself (size, flex direction, font size), pass a `class` and
	 * target it with `:global()` from the parent. Set `--card-bg` to change the
	 * background color and `--card-radius` to change the corner radius.
	 */
	let {
		children,
		href,
		onclick,
		level = 'default',
		selected,
		padding = '0.7em 0.8em',
		gap,
		class: className,
		...rest
	}: {
		children: Snippet;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		level?: 'low' | 'default' | 'high';
		/** Marks the chosen card of a set. A button card also reports it as pressed. */
		selected?: boolean;
		padding?: string;
		gap?: string;
		class?: ClassValue;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'onclick'> = $props();

	let base = $derived(
		level === 'default' ? 'var(--surface-container)' : `var(--surface-container-${level})`
	);

	let classes = $derived(['card', className, { selected }]);
</script>

{#if href !== undefined}
	<!-- Callers hand over an href they have already resolved. -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		{...rest}
		{href}
		{onclick}
		class={[classes, 'interactive']}
		style:--card-base={base}
		style:padding
		style:gap
	>
		{@render children()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else if onclick !== undefined}
	<button
		{...rest}
		type="button"
		{onclick}
		aria-pressed={selected}
		class={[classes, 'interactive']}
		style:--card-base={base}
		style:padding
		style:gap
	>
		{@render children()}
	</button>
{:else}
	<div {...rest} class={classes} style:--card-base={base} style:padding style:gap>
		{@render children()}
	</div>
{/if}

<style>
	.card {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		min-width: 0;
		margin: 0;
		/* Only visible in forced-colors mode, which drops the fill and would otherwise
		   leave the card without an edge. */
		border: 1px solid transparent;
		border-radius: var(--card-radius, 0.7em);
		background: var(--card-bg, var(--card-base));
		overflow: hidden;
		appearance: none;
		color: inherit;
		font: inherit;
		text-align: inherit;
		text-decoration: none;
	}

	.interactive {
		cursor: pointer;
		transition: background 120ms ease-out;
	}

	.interactive:hover {
		background: color-mix(in srgb, var(--on-surface) 7%, var(--card-bg, var(--card-base)));
	}

	.interactive:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.selected,
	.selected:hover {
		background: color-mix(in srgb, var(--primary) 12%, var(--card-bg, var(--card-base)));
		outline: 2px solid var(--primary);
	}
</style>
