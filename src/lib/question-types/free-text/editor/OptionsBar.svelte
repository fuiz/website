<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { countMap, timeMap } from '$lib/question-types/editor/optionMaps';
	import type { FreeTextSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import FormatListNumbered from '~icons/material-symbols/format-list-numbered';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: FreeTextSlide;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="free-text-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.freeText.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="free-text-limit"
		label={m.time_limit()}
		options={limits.fuiz.freeText.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="free-text-entries"
		label={m.entries_per_player()}
		options={limits.fuiz.freeText.allowedEntryCounts}
		map={countMap}
		bind:selected={activeSlide.max_entries}
	>
		{#snippet leading()}<FormatListNumbered height="1em" />{/snippet}
	</OptionsField>
</OptionsBarLayout>
