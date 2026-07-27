<script lang="ts">
	import ScalePicker from '$lib/game/ScalePicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { Media, ScaleLabels, ScaleStyle } from '$lib/types';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		points,
		labels,
		style,
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
		points: number[];
		labels: ScaleLabels;
		style: ScaleStyle;
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
		<div class="hint">{style === 'Nps' ? m.nps_host_hint() : m.scale_host_hint()}</div>
		<ScalePicker {points} {labels} {style} />
	</div>
</AnswersLayout>

<style>
	.area {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
		padding: 1.5em clamp(1em, 6vw, 5em) 2em;
		font-size: 1.2em;
	}

	.hint {
		text-align: center;
		opacity: 0.7;
		font-family: var(--alternative-font);
	}
</style>
