<script lang="ts">
	import PinBoard from '$lib/game/PinBoard.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media, PinResults, PinShape } from '$lib/types';
	import Check from '~icons/custom/check';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		media,
		correctShape,
		results,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		media: Media | undefined;
		correctShape: PinShape | undefined;
		results: PinResults;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();
</script>

<StatisticsLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{onnext}
	{onlock}
	responses={{ count: results.total_count }}
>
	<div class="content">
		<div class="stats">
			{#if results.correct_count !== null}
				<div class="stat">
					<span class="value">{results.correct_count}/{results.total_count}</span>
					<span class="caption">
						<Check height="0.9em" title={m.correct()} />
						{m.on_target()}
					</span>
				</div>
			{:else}
				<div class="stat">
					<span class="value">{results.total_count}</span>
					<span class="caption">{m.pins_dropped()}</span>
				</div>
			{/if}
		</div>
		<div class="board">
			<PinBoard
				{media}
				pins={results.pins}
				shape={correctShape}
				showShape={correctShape !== undefined}
			/>
		</div>
	</div>
</StatisticsLayout>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: 2em;
		padding: 0.4em;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.value {
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 2em;
		line-height: 1.1;
	}

	.caption {
		display: inline-flex;
		align-items: center;
		gap: 0.25em;
		opacity: 0.7;
		font-size: 0.9em;
	}

	.board {
		flex: 1;
		min-height: 0;
		padding: 0.4em 0.5em 0.8em;
		box-sizing: border-box;
	}
</style>
