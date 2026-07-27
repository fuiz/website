<script lang="ts">
	import ResponseList from '$lib/game/ResponseList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

	// The collection half of a brainstorm: ideas land on the board live as
	// players send them, so the room can see it filling up.
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		ideas,
		timeLeft,
		timeStarted,
		answeredCount,
		media,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		ideas: string[];
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		media: Media | undefined;
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
	<div class="board">
		<ResponseList {responses} emptyMessage={m.waiting_for_ideas()} />
	</div>
</AnswersLayout>

<style>
	.board {
		flex: 1;
		min-height: 0;
		max-height: 60dvh;
	}
</style>
