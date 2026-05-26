<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';

	let {
		name,
		score = undefined,
		centered = false,
		belowTopbar,
		children
	}: {
		name: string;
		score?: number;
		centered?: boolean;
		belowTopbar?: import('svelte').Snippet;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="page">
	<Topbar {name} {score} />
	{@render belowTopbar?.()}
	<div class="body">
		<NiceBackground>
			{#if centered}
				<div class="center">
					{@render children()}
				</div>
			{:else}
				{@render children()}
			{/if}
		</NiceBackground>
	</div>
</div>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
		min-height: 0;
	}

	.center {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
