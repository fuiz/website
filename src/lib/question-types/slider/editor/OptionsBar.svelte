<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { pointsMap, timeMap } from '$lib/question-types/editor/optionMaps';
	import type { SliderSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import SportsScore from '~icons/material-symbols/sports-score';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: SliderSlide;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="slider-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.slider.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="slider-limit"
		label={m.time_limit()}
		options={limits.fuiz.slider.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="slider-points"
		label={m.points()}
		options={limits.fuiz.slider.allowedPointsAwarded}
		map={pointsMap}
		bind:selected={activeSlide.points_awarded}
	>
		{#snippet leading()}<SportsScore height="1em" />{/snippet}
	</OptionsField>
</OptionsBarLayout>
