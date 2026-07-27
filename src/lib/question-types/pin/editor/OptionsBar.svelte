<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { pointsMap, timeMap } from '$lib/question-types/editor/optionMaps';
	import type { PinSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import SportsScore from '~icons/material-symbols/sports-score';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: PinSlide;
	} = $props();

	// A drop pin has no target, so there is nothing to award points for.
	let scored = $derived(activeSlide.correct_area != null);
</script>

<OptionsBarLayout>
	<OptionsField
		id="pin-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.pin.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="pin-limit"
		label={m.time_limit()}
		options={limits.fuiz.pin.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	{#if scored}
		<OptionsField
			id="pin-points"
			label={m.points()}
			options={limits.fuiz.pin.allowedPointsAwarded}
			map={pointsMap}
			bind:selected={activeSlide.points_awarded}
		>
			{#snippet leading()}<SportsScore height="1em" />{/snippet}
		</OptionsField>
	{/if}
</OptionsBarLayout>
