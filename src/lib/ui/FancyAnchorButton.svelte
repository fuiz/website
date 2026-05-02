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
	<div
		style:height="100%"
		style:padding="5px"
		style:font-weight="bold"
		style:box-sizing="border-box"
	>
		{@render children?.()}
	</div>
</FancyAnchorButtonBase>
