<script lang="ts">
	import SliderTrack from '$lib/game/SliderTrack.svelte';
	import StatisticsLayout from '$lib/question-types/host/StatisticsLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media, SliderRange, SliderResults } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		range,
		unit,
		correct,
		tolerance,
		results,
		media,
		onnext,
		onlock
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		range: SliderRange;
		unit: string | undefined;
		correct: number;
		tolerance: number;
		results: SliderResults;
		media: Media | undefined;
		onnext?: () => void;
		onlock?: (locked: boolean) => void;
	} = $props();

	let average = $derived(results.average);
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
	<!-- No summary row: the answer and the average are both named on the axis
	     now, and a tally of who scored said less than the shape of the guesses
	     already shows. The chart is the whole screen. -->
	<div class="area">
		<SliderTrack
			{range}
			{unit}
			{correct}
			{tolerance}
			average={average ?? undefined}
			distribution={results.distribution}
			fill
		/>
	</div>
</StatisticsLayout>

<style>
	.area {
		height: 100%;
		min-height: 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 1em clamp(1em, 6vw, 5em) 1.5em;
		font-size: 1.3em;
	}
</style>
