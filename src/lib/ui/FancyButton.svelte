<script lang="ts">
	import type { Snippet } from 'svelte';
	import FancyButtonBase from './FancyButtonBase.svelte';

	let {
		foregroundColor = undefined,
		backgroundColor = undefined,
		backgroundDeepColor = undefined,
		disabled = false,
		active = true,
		type = undefined,
		height = undefined,
		onclick = undefined,
		children
	}: {
		foregroundColor?: string;
		backgroundColor?: string;
		backgroundDeepColor?: string;
		disabled?: boolean;
		active?: boolean;
		type?: 'button' | 'submit' | 'reset';
		height?: string;
		onclick?: () => void;
		children?: Snippet;
	} = $props();
</script>

<FancyButtonBase
	{type}
	foregroundColor={foregroundColor ?? '#FFFFFF'}
	backgroundColor={backgroundColor ?? 'var(--primary)'}
	backgroundDeepColor={backgroundDeepColor ?? 'color-mix(in srgb, var(--primary) 80%, black)'}
	{disabled}
	{active}
	{height}
	{onclick}
>
	<div
		style:height="100%"
		style:padding="5px"
		style:font-weight=500
		style:box-sizing="border-box"
	>
		{@render children?.()}
	</div>
</FancyButtonBase>
