<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { timeMap } from '$lib/question-types/editor/optionMaps';
	import type { ScaleSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import LinearScale from '~icons/material-symbols/linear-scale';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: ScaleSlide;
	} = $props();

	// NPS is defined as 0-10, so its range isn't the author's to choose.
	let isNps = $derived(activeSlide.style === 'Nps');
</script>

<OptionsBarLayout>
	<OptionsField
		id="scale-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.scale.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="scale-limit"
		label={m.time_limit()}
		options={limits.fuiz.scale.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	{#if !isNps}
		<OptionsField
			id="scale-max"
			label={m.scale_points()}
			options={limits.fuiz.scale.allowedAgreementMaximums}
			map={(value: number) => `1–${value}`}
			bind:selected={activeSlide.max}
		>
			{#snippet leading()}<LinearScale height="1em" />{/snippet}
		</OptionsField>
	{/if}
</OptionsBarLayout>
