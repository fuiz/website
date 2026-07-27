<script lang="ts">
	import ResponseList from '$lib/game/ResponseList.svelte';
	import WordCloud from '$lib/game/WordCloud.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { FreeTextMode, FreeTextResults, Media } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		mode,
		results,
		media,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		mode: FreeTextMode;
		results: FreeTextResults;
		media: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();

	let responses = $derived(
		results.entries.map((entry) => ({ text: entry.text, badge: entry.count }))
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
	<div class="content">
		<div class="summary">
			{m.responses_from({ entries: results.total_entries, players: results.total_count })}
		</div>
		<div class="body">
			{#if mode === 'WordCloud'}
				<WordCloud entries={results.entries} />
			{:else}
				<ResponseList {responses} badgeLabel={m.times_said()} />
			{/if}
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

	.summary {
		text-align: center;
		padding: 0.4em;
		opacity: 0.7;
		font-family: var(--alternative-font);
	}

	.body {
		flex: 1;
		min-height: 0;
	}
</style>
