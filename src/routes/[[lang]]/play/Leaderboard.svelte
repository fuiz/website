<script lang="ts">
	import { medalColors } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import WorkspacePremiumOutline from '~icons/material-symbols/workspace-premium-outline';

	let {
		name,
		score,
		position,
		final
	}: {
		name: string;
		score: number;
		position: number | undefined;
		final: boolean;
	} = $props();
</script>

<PlayerLayout {name} {score} centered>
	<div class="stack">
		{#if position !== undefined}
			{#if position < 3}
				<div class="medal">
					<div style:color={medalColors[position]}>
						<WorkspacePremiumOutline height="200px" width="200px" title={m.medal()} />
					</div>
					<div style:color={medalColors[position]}>
						{#if position === 0}
							{m.first()}
						{:else if position === 1}
							{m.second()}
						{:else}
							{m.third()}
						{/if}
					</div>
				</div>
				{#if final}
					{m.great_job()}
				{:else}
					{m.keep_it_up()}
				{/if}
			{:else}
				<div class="rank">
					#{position + 1}
				</div>
				{#if final}
					{m.not_bad()}
				{:else}
					{m.catch_up()}
				{/if}
			{/if}
		{:else}
			{m.not_there()}
		{/if}
	</div>
</PlayerLayout>

<style>
	.stack {
		display: flex;
		gap: 10px;
		flex-direction: column;
		align-items: center;
	}

	.medal {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--palette-dark);
		border: 0.15em solid;
		border-radius: 0.7em;
		padding: 0.5em;
		font-family: var(--alternative-font);
		box-sizing: border-box;
	}

	.rank {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 3em;
	}
</style>
