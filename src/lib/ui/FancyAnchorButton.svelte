<script>
	import FancyAnchorButtonBase from './FancyAnchorButtonBase.svelte';

	/** @type {{
	 * foregroundColor?: string;
	 * backgroundColor?: string;
	 * backgroundDeepColor?: string;
	 * href: string;
	 * children?: import('svelte').Snippet;
	 * download?: any;
	}}*/
	let {
		foregroundColor = undefined,
		backgroundColor = undefined,
		backgroundDeepColor = undefined,
		href,
		download,
		children
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
