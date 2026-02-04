<script>
	import FancyButtonBase from './FancyButtonBase.svelte';

	/** @type {{
	 * foregroundColor?: string | undefined,
	 * backgroundColor?: string | undefined,
	 * backgroundDeepColor?: string | undefined,
	 * disabled?: boolean,
	 * active?: boolean,
	 * type?: 'button' | 'submit' | 'reset' | undefined,
	 * height?: string | undefined,
	 * onclick?: () => void,
	 * children?: import('svelte').Snippet
	 * }} */
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
	} = $props();
</script>

<FancyButtonBase
	{type}
	foregroundColor={foregroundColor ?? '#FFFFFF'}
	backgroundColor={backgroundColor ?? '#D4131B'}
	backgroundDeepColor={backgroundDeepColor ?? '#A40E13'}
	{disabled}
	{active}
	{height}
	{onclick}
>
	<div
		style:height="100%"
		style:padding="5px"
		style:font-weight="bold"
		style:box-sizing="border-box"
	>
		{@render children?.()}
	</div>
</FancyButtonBase>
