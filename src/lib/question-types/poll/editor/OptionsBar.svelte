<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { timeMap } from '$lib/question-types/editor/optionMaps';
	import type { PollSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: PollSlide;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="poll-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.poll.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="poll-limit"
		label={m.time_limit()}
		options={limits.fuiz.poll.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
</OptionsBarLayout>
