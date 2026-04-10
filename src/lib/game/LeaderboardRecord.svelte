<script lang="ts">
	import { medalColors } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import Counter from '$lib/ui/Counter.svelte';
	import WorkspacePremiumOutline from '~icons/material-symbols/workspace-premium-outline';

	let {
		name,
		score,
		index,
		final,
		duration,
		delay
	}: {
		name: string;
		score: number;
		index: number;
		final: boolean;
		duration: number;
		delay: number;
	} = $props();

	let showMedal = $state(false);
	let showFirst = $state(false);

	$effect(() => {
		if (final && index < 3) {
			const timer = setTimeout(() => {
				showMedal = true;
				if (index === 0) showFirst = true;
			}, delay + duration);
			return () => clearTimeout(timer);
		} else {
			showMedal = false;
			showFirst = false;
		}
	});
</script>

<div class="entry" class:first={showFirst}>
	<div class="medal-slot" class:visible={showMedal}>
		<div class="medal">
			<WorkspacePremiumOutline
				width="1.4em"
				height="1.4em"
				color={medalColors[index]}
				title={m.medal()}
			/>
		</div>
	</div>
	<div class="name" title={name}>
		{name}
	</div>
	<div class="score">
		<Counter value={score} {duration} {delay} />
	</div>
</div>

<style>
	.medal-slot {
		max-width: 0;
		overflow: hidden;
		transition: max-width 1s ease;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.medal-slot.visible {
		max-width: 2em;
	}

	.medal {
		display: flex;
		align-items: center;
	}

	.entry {
		background: var(--surface-variant);
		padding: 0.4em 0.8em;
		font-weight: bold;
		overflow: hidden;
		border-radius: 0.6em;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4em;
		transition: background 1s ease, color 1s ease;
		min-width: 0;
		max-width: 100%;
	}

	.name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex: 1;
	}

	.score {
		flex-basis: max-content;
	}

	.entry.first {
		background: var(--on-surface);
		color: var(--surface);
	}
</style>
