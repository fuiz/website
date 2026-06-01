<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Palette } from '$lib/clientOnly';
	import FancyButtonBase from './FancyButtonBase.svelte';

	let {
		palette = undefined,
		disabled = false,
		active = true,
		type = undefined,
		height = undefined,
		onclick = undefined,
		children
	}: {
		palette?: Palette;
		disabled?: boolean;
		active?: boolean;
		type?: 'button' | 'submit' | 'reset';
		height?: string;
		onclick?: () => void;
		children?: Snippet;
	} = $props();
</script>

<FancyButtonBase {type} {palette} {disabled} {active} {height} {onclick}>
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
