<script lang="ts">
	import SliderTrack from '$lib/game/SliderTrack.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media, SliderRange } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		range,
		unit,
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
		range: SliderRange;
		unit: string | undefined;
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();
</script>

<AnswersLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{timeLeft}
	{timeStarted}
	{answeredCount}
	{media}
	{onlock}
	{onnext}
>
	<div class="area">
		<div class="hint">{m.slider_host_hint()}</div>
		<SliderTrack {range} {unit} />
	</div>
</AnswersLayout>

<style>
	.area {
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		padding: 1.5em clamp(1em, 6vw, 5em) 2em;
		font-size: 1.3em;
	}

	.hint {
		text-align: center;
		opacity: 0.7;
		font-family: var(--alternative-font);
	}
</style>
