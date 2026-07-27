<script lang="ts">
	import ResponseList from '$lib/game/ResponseList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		ideas,
		maxVotes,
		timeLeft,
		timeStarted,
		answeredCount,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		ideas: string[];
		maxVotes: number;
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();

	let responses = $derived(ideas.map((idea) => ({ text: idea })));
</script>

<AnswersLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{timeLeft}
	{timeStarted}
	{answeredCount}
	media={undefined}
	{onlock}
	{onnext}
>
	<div class="wrap">
		<div class="hint">{m.brainstorm_vote_hint({ count: maxVotes })}</div>
		<div class="board">
			<ResponseList {responses} />
		</div>
	</div>
</AnswersLayout>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		min-height: 0;
		max-height: 60dvh;
	}

	.hint {
		text-align: center;
		padding: 0.3em;
		opacity: 0.7;
		font-family: var(--alternative-font);
	}

	.board {
		flex: 1;
		min-height: 0;
	}
</style>
