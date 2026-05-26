<script lang="ts">
	import Answers from '$lib/game/Answers.svelte';
	import Statistics from '$lib/game/Statistics.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		timeLeft = undefined,
		timeStarted = undefined,
		media,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		answers: { text: string; count: number; correct: boolean }[];
		timeLeft?: number;
		timeStarted?: number;
		media?: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();
</script>

<StatisticsLayout bind:bindableGameInfo {gameInfo} {questionText} {media} {onnext} {onlock}>
	<VerticalSplit>
		{#snippet top()}
			{#if timeLeft !== undefined && timeStarted !== undefined}
				<TimeLeft {timeLeft} {timeStarted} />
			{/if}
			<Statistics
				statistics={answers.map(({ count, correct }) => {
					return { count, correct };
				})}
			/>
		{/snippet}
		{#snippet bottom()}
			<div class="answers-large">
				<Answers {answers} />
			</div>
		{/snippet}
	</VerticalSplit>
</StatisticsLayout>

<style>
	.answers-large {
		font-size: 1.5em;
	}
</style>
