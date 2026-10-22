<script lang="ts">
	import { getRecap, type RecapVerdict } from '$lib/feedback/recap/context';
	import RecapStrip from '$lib/feedback/recap/RecapStrip.svelte';
	import RecapView from '$lib/feedback/recap/RecapView.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';

	let {
		name,
		score = undefined,
		centered = false,
		pendingVerdict,
		belowTopbar,
		children
	}: {
		name: string;
		score?: number;
		centered?: boolean;
		/** The verdict on the slide being shown, for the recap strip until the slide is over. */
		pendingVerdict?: RecapVerdict;
		belowTopbar?: import('svelte').Snippet;
		children: import('svelte').Snippet;
	} = $props();

	const recap = getRecap();

	let viewingAt = $derived(
		recap?.viewing === undefined
			? -1
			: recap.entries.findIndex((entry) => entry.index === recap.viewing)
	);
	let viewing = $derived(viewingAt === -1 ? undefined : recap?.entries[viewingAt]);
</script>

<div class="page">
	<Topbar {name} {score} />
	{#if recap}
		<RecapStrip {recap} pending={pendingVerdict} />
	{/if}
	{#if !viewing}
		{@render belowTopbar?.()}
	{/if}
	<div class="body">
		<NiceBackground>
			{#if viewing}
				<RecapView
					entry={viewing}
					previous={recap?.entries[viewingAt - 1]}
					next={recap?.entries[viewingAt + 1]}
					onview={(index) => recap?.view(index)}
					onback={() => recap?.view(undefined)}
				/>
			{:else if centered}
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
