<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Palette } from '$lib/clientOnly';
	import FancyAnchorButtonBase from './FancyAnchorButtonBase.svelte';

	let {
		palette = undefined,
		href,
		download,
		children
	}: {
		palette?: Palette;
		href: string;
		download?: unknown;
		children?: Snippet;
	} = $props();
</script>

<FancyAnchorButtonBase {palette} {href} {download}>
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
