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
			<div
				class="card-wrap"
				style:--medal-color={position < 3 ? medalColors[position] : 'var(--on-surface)'}
			>
				{#if position < 3}
					<div class="medal">
						<div class="medal-icon">
							<WorkspacePremiumOutline height="200px" width="200px" title={m.medal()} />
						</div>
						<div class="medal-label">
							{#if position === 0}
								{m.first()}
							{:else if position === 1}
								{m.second()}
							{:else}
								{m.third()}
							{/if}
						</div>
					</div>
				{:else}
					<div class="rank">#{position + 1}</div>
				{/if}
				<div class="sticker">
					{#if position < 3}
						{final ? m.great_job() : m.keep_it_up()}
					{:else}
						{final ? m.not_bad() : m.catch_up()}
					{/if}
				</div>
			</div>
		{:else}
			{m.not_there()}
		{/if}
	</div>
</PlayerLayout>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--alternative-font);
	}

	.card-wrap {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.medal {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2em;
		border: 1px solid color-mix(in srgb, var(--medal-color) 55%, transparent);
		background: color-mix(in srgb, var(--medal-color) 12%, var(--surface));
		border-radius: 0.7em;
		padding: 0.8em 1.2em;
		box-sizing: border-box;
	}

	.medal-icon {
		color: var(--medal-color);
	}

	.medal-label {
		color: var(--medal-color);
		font-weight: 800;
		font-size: 1.1em;
	}

	.rank {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 3em;
		font-weight: 800;
		border: 1px solid var(--outline);
		background: var(--surface);
		border-radius: 0.7em;
		padding: 0.4em 0.8em;
		line-height: 1;
	}

	.sticker {
		position: absolute;
		top: -0.6em;
		right: -0.8em;
		background: var(--medal-color);
		color: var(--surface);
		font-weight: 800;
		padding: 0.3em 0.7em;
		border-radius: 0.4em;
		font-size: 1em;
		transform: rotate(6deg);
		box-shadow: 0 0.1em 0.3em color-mix(in srgb, var(--on-surface) 25%, transparent);
		white-space: nowrap;
	}
</style>
