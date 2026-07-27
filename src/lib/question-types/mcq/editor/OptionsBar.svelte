<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { pointsMap, timeMap } from '$lib/question-types/editor/optionMaps';
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

	function answerModeMap(v: 'SingleAnswer' | 'MultipleAnswers') {
		return v === 'MultipleAnswers' ? m.multiple_answers() : m.single_answer();
	}
</script>

<OptionsBarLayout>
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
</OptionsBarLayout>
