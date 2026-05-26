<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';

	let {
		name,
		score = undefined,
		centered = false,
		children
	}: {
		name: string;
		score?: number;
		centered?: boolean;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="page">
	<Topbar {name} {score} />
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
	}

	.center {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
