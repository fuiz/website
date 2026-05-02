<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		message,
		icon,
		background,
		color
	}: {
		message: string;
		icon: Snippet;
		background: string;
		color: string;
	} = $props();
</script>

{#if message}
	<div
		class="message"
		style:background
		style:color
		style:border-color={color}
	>
		{@render icon()}
		<div class="text">
			{message}
		</div>
	</div>
{/if}

<style>
	.message {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 5px 10px;
		box-sizing: border-box;
		border-radius: 0.7em;
		gap: 10px;
		font-weight: bold;
		border: 1px solid;
		word-wrap: anywhere;
	}

	.text {
		flex: 1;
		text-align: center;
	}
</style>
