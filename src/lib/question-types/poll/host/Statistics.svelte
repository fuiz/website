<script lang="ts">
	import ResultBars from '$lib/game/ResultBars.svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media, PollResults } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		results,
		media,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		answers: string[];
		results: PollResults;
		media: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();

	let bars = $derived(
		answers.map((answer, index) => ({
			label: answer,
			count: results.counts[index] ?? 0
		}))
	);
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
	<VerticalSplit>
		{#snippet top()}
			<div class="total">
				<span class="value">{results.total_count}</span>
				<span class="caption">{m.votes()}</span>
			</div>
		{/snippet}
		{#snippet bottom()}
			<div class="area">
				<ResultBars {bars} total={results.total_count} />
			</div>
		{/snippet}
	</VerticalSplit>
</StatisticsLayout>

<style>
	.total {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.4em;
	}

	.value {
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 2.6em;
		line-height: 1.1;
	}

	.caption {
		opacity: 0.7;
	}

	.area {
		padding-bottom: 1.5em;
	}
</style>
