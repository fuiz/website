<script lang="ts">
	import type { Snippet } from 'svelte';
	import FancyAnchorButtonBase from './FancyAnchorButtonBase.svelte';

	let {
		foregroundColor = undefined,
		backgroundColor = undefined,
		backgroundDeepColor = undefined,
		href,
		download,
		children
	}: {
		foregroundColor?: string;
		backgroundColor?: string;
		backgroundDeepColor?: string;
		href: string;
		children?: Snippet;
		download?: unknown;
	} = $props();
</script>

<FancyAnchorButtonBase
	foregroundColor={foregroundColor ?? '#FFFFFF'}
	backgroundColor={backgroundColor ?? 'var(--primary)'}
	backgroundDeepColor={backgroundDeepColor ?? 'color-mix(in srgb, var(--primary) 80%, black)'}
	{href}
	{download}
>
	<div class="content">
		{@render children?.()}
	</div>
</FancyAnchorButtonBase>

<style>
	.content {
		height: 100%;
		padding: 5px;
		font-weight: bold;
		box-sizing: border-box;
	}
</style>
