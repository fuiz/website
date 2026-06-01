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
	<div class="content">
		{@render children?.()}
	</div>
</FancyButtonBase>

<style>
	.content {
		height: 100%;
		padding: 5px;
		font-weight: 500;
		box-sizing: border-box;
	}
</style>
