<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolveIfInternal } from './resolveIfInternal';

	let {
		message,
		icon,
		background,
		color = 'inherit',
		href
	}: {
		message: string;
		icon: Snippet;
		background: string;
		color?: string;
		href: string;
	} = $props();
</script>

{#if message}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={resolveIfInternal(href)} style:--background={background} style:--color={color}>
		{@render icon()}
		<div class="text">
			{message}
		</div>
	</a>
{/if}

<style>
	a {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 5px 10px;
		box-sizing: border-box;
		border-radius: 5px;
		gap: 10px;
		background: var(--background);
		color: var(--color);
		font-weight: bold;
		word-wrap: anywhere;
	}

	.text {
		flex: 1;
		text-align: center;
	}
</style>
