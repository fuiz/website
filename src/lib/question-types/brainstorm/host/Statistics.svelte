<script lang="ts">
	import ResponseList from '$lib/game/ResponseList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { BrainstormResults, Media } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		results,
		media,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		results: BrainstormResults;
		media: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();

	let responses = $derived(results.ideas.map((idea) => ({ text: idea.text, badge: idea.votes })));
</script>

<StatisticsLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{media}
	{onnext}
	{onlock}
	responses={{ count: results.contributor_count }}
>
	<div class="content">
		<div class="summary">
			{m.brainstorm_summary({
				ideas: results.ideas.length,
				contributors: results.contributor_count,
				voters: results.voter_count
			})}
		</div>
		<div class="board">
			<ResponseList {responses} badgeLabel={m.votes()} />
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

	.board {
		flex: 1;
		min-height: 0;
	}
</style>
