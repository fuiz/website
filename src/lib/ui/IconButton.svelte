<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		alt,
		disabled = false,
		padding = '0',
		onclick,
		onmouseover,
		onmouseenter,
		onfocus,
		popovertarget
	}: {
		children: Snippet;
		alt: string;
		disabled?: boolean;
		padding?: string;
		onclick?: () => void;
		onmouseover?: () => void;
		onmouseenter?: () => void;
		onfocus?: () => void;
		popovertarget?: string;
	} = $props();
</script>

<button
	style:padding
	{popovertarget}
	{disabled}
	{onclick}
	{onmouseover}
	{onmouseenter}
	{onfocus}
	title={alt}
>
	{@render children()}
</button>

<style>
	button {
		background: none;
		border-radius: 4px;
		font: inherit;
		display: flex;
		align-items: center;
		aspect-ratio: 1;
		appearance: none;
		box-sizing: border-box;
		border: none;
		color: inherit;

		cursor: pointer;
	}

	button:disabled {
		cursor: normal;
		opacity: 0.7;
	}

	button:where(:global(:hover, :focus)) {
		background: #00000040;
		outline: 2px solid #ffffff40;
	}
</style>
