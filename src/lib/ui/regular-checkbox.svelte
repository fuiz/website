<script>
	import { scale } from 'svelte/transition';

	let { checked } = $props();
</script>

<div class="border">
	{#if checked}
		<div class="fill" transition:scale={{ duration: 200 }}></div>
	{/if}
</div>

<style>
	.border {
		box-sizing: border-box;
		border: 0.15em solid;
		padding: 3px;
		border-radius: 0.25em;
		overflow: hidden;
		height: 1em;
		width: 1em;
		margin: 0.125em;
	}

	.fill {
		height: 100%;
		border-radius: 0.1em;
		background-color: var(--accent-color);
	}
</style>
