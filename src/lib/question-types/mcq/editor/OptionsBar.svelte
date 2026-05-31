<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import type { MultipleChoiceSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import SportsScore from '~icons/material-symbols/sports-score';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: MultipleChoiceSlide;
	} = $props();

	activeSlide.answer_mode ??= 'SingleAnswer';

	function timeMap(v: number | null) {
		return v === null ? '∞' : `${v / 1000}s`;
	}

	function pointsMap(v: number) {
		if (v === 0) return m.none();
		if (v === 500) return m.half();
		if (v === 1000) return m.regular();
		if (v === 2000) return m.double();
		return String(v);
	}

	function answerModeMap(v: 'SingleAnswer' | 'MultipleAnswers') {
		return v === 'MultipleAnswers' ? m.multiple_answers() : m.single_answer();
	}
</script>

<div id="sidebar-container">
	<div id="sidebar">
		<OptionsField
			id="mcq-intro"
			label={m.time_before_answers()}
			options={limits.fuiz.multipleChoice.allowedIntroduceQuestion}
			map={timeMap}
			bind:selected={activeSlide.introduce_question}
		>
			{#snippet leading()}<TimerOutline height="1em" />{/snippet}
		</OptionsField>
		<OptionsField
			id="mcq-limit"
			label={m.time_limit()}
			options={limits.fuiz.multipleChoice.allowedTimeLimits}
			map={timeMap}
			bind:selected={activeSlide.time_limit}
		>
			{#snippet leading()}<TimerOutline height="1em" />{/snippet}
		</OptionsField>
		<OptionsField
			id="mcq-points"
			label={m.points()}
			options={limits.fuiz.multipleChoice.allowedPointsAwarded}
			map={pointsMap}
			bind:selected={activeSlide.points_awarded}
		>
			{#snippet leading()}<SportsScore height="1em" />{/snippet}
		</OptionsField>
		<OptionsField
			id="mcq-answer-mode"
			label={m.answer_mode()}
			options={['SingleAnswer', 'MultipleAnswers'] as const}
			map={answerModeMap}
			bind:selected={activeSlide.answer_mode}
		/>
	</div>
</div>

<style>
	#sidebar {
		width: 11em;
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		padding: 0.4em;
		border-inline-start: 1px solid var(--outline);
		height: 100%;
		box-sizing: border-box;
	}

	@media only screen and (max-width: 900px) {
		#sidebar {
			overflow-x: auto;
			width: auto;
			flex-direction: row;
			border-block-end: 1px solid var(--outline);
			border-inline-start: none;
		}

		#sidebar > :global(*) {
			min-width: max-content;
			flex-shrink: 0;
		}

		#sidebar-container {
			min-width: 100%;
			width: 0px;
		}
	}
</style>
