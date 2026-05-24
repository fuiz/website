<script lang="ts">
	import type { Snippet } from 'svelte';
	import Close from '~icons/custom/close';

	let {
		selected = false,
		removable = false,
		size = 'md',
		ariaLabel,
		onclick,
		children
	}: {
		selected?: boolean;
		removable?: boolean;
		size?: 'sm' | 'md';
		ariaLabel?: string;
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

<button
	type="button"
	class="chip"
	class:selected
	class:sm={size === 'sm'}
	aria-label={ariaLabel}
	{onclick}
>
	{@render children()}
	{#if removable}
		<Close height="1em" width="1em" aria-hidden="true" />
	{/if}
</button>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		border: 0.1em solid color-mix(in srgb, currentColor 40%, transparent);
		background: transparent;
		color: inherit;
		border-radius: 2em;
		padding: 0.3em 0.7em;
		font-family: inherit;
		font-size: inherit;
		font-weight: bold;
		cursor: pointer;
		transition:
			background 200ms ease,
			color 200ms ease,
			border-color 200ms ease;
		user-select: none;
	}

	.chip.sm {
		font-size: 0.65em;
		font-weight: normal;
		padding: 0.1em 0.5em;
	}

	.chip:hover {
		background: color-mix(in srgb, currentColor 10%, transparent);
	}

	.chip.selected {
		background: var(--primary);
		color: var(--on-primary);
		border-color: var(--primary);
	}

	.chip.selected:hover {
		background: color-mix(in srgb, var(--primary) 85%, black);
	}

</style>
