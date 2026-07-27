<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { pointsMap, timeMap } from '$lib/question-types/editor/optionMaps';
	import type { OrderSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import SportsScore from '~icons/material-symbols/sports-score';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: OrderSlide;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="order-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.order.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="order-limit"
		label={m.time_limit()}
		options={limits.fuiz.order.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="order-points"
		label={m.points()}
		options={limits.fuiz.order.allowedPointsAwarded}
		map={pointsMap}
		bind:selected={activeSlide.points_awarded}
	>
		{#snippet leading()}<SportsScore height="1em" />{/snippet}
	</OptionsField>
</OptionsBarLayout>
