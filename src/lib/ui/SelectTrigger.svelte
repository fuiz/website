<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		value,
		leading,
		onclick,
		popovertarget,
		anchorName,
		disabled = false,
		ariaLabel
	}: {
		value: string;
		leading?: Snippet;
		onclick?: () => void;
		popovertarget?: string;
		anchorName?: string;
		disabled?: boolean;
		ariaLabel?: string;
	} = $props();
</script>

<button
	type="button"
	class="trigger"
	style:anchor-name={anchorName ? `--${anchorName}` : undefined}
	{disabled}
	{onclick}
	{popovertarget}
	aria-label={ariaLabel}
	aria-haspopup="listbox"
>
	{#if leading}
		<span class="leading">{@render leading()}</span>
	{/if}
	<span class="value">{value}</span>
	<span class="chev"></span>
</button>

<style>
	.trigger {
		appearance: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		font: inherit;
		color: inherit;
		background: none;
		border: 1px solid color-mix(in srgb, var(--on-surface) 25%, transparent);
		border-radius: 999px;
		padding: 0.35em 0.5em 0.35em 0.8em;
		cursor: pointer;
		transition:
			border-color 100ms cubic-bezier(0.2, 0, 0, 1),
			background 100ms cubic-bezier(0.2, 0, 0, 1);
	}

	.trigger:hover:not(:disabled) {
		background: color-mix(in srgb, var(--on-surface) 6%, transparent);
	}

	.trigger:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.leading {
		display: inline-flex;
		align-items: center;
		color: var(--on-surface-variant);
	}

	.value {
		text-transform: capitalize;
	}

	.chev {
		width: 0.45em;
		height: 0.45em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: translateY(-25%) rotate(45deg);
		opacity: 0.6;
		margin-inline-start: auto;
		margin-inline-end: 0.3em;
	}
</style>
