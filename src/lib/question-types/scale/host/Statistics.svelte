<script lang="ts">
	import ScalePicker from '$lib/game/ScalePicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media, ScaleLabels, ScaleResults, ScaleStyle } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		points,
		labels,
		style,
		results,
		media,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		points: number[];
		labels: ScaleLabels;
		style: ScaleStyle;
		results: ScaleResults;
		media: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();

	let nps = $derived(style === 'Nps' ? results.nps : null);
</script>

<StatisticsLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{media}
	{onnext}
	{onlock}
	responses={{ count: results.total_count }}
>
	<div class="wrap">
			<div class="stats">
				{#if nps}
					<div class="stat headline">
						<span class="value">{Math.round(nps.score)}</span>
						<span class="caption">{m.nps_score()}</span>
					</div>
				{:else if results.average !== null}
					<div class="stat headline">
						<span class="value">{results.average.toFixed(1)}</span>
						<span class="caption">{m.average_rating()}</span>
					</div>
				{/if}
			</div>
		<div class="area">
				<ScalePicker
					{points}
					{labels}
					{style}
					fill
					counts={results.counts}
					total={results.total_count}
				/>
		</div>
	</div>
</StatisticsLayout>

<style>
	.wrap {
		height: 100%;
		display: grid;
		/* Summary first at its natural height, then the chart taking the rest. */
		grid-template-rows: auto 1fr;
		min-height: 0;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-end;
		gap: clamp(0.8em, 4vw, 2.5em);
		padding: 0.5em 1em;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1em;
	}

	.value {
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1.9em;
		line-height: 1.1;
	}

	.headline .value {
		font-size: 3em;
		color: var(--primary);
	}

	.caption {
		opacity: 0.7;
		font-size: 0.9em;
	}

	.area {
		min-height: 0;
		padding: 0.5em clamp(1em, 6vw, 5em) 1.5em;
		font-size: 1.2em;
	}

	@media (max-width: 600px) {
		.headline .value {
			font-size: 2em;
		}

		.value {
			font-size: 1.4em;
		}
	}
</style>
