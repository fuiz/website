<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { timeMap } from '$lib/question-types/editor/optionMaps';
	import type { InfoSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: InfoSlide;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="info-duration"
		label={m.slide_duration()}
		options={limits.fuiz.infoSlide.allowedDurations}
		map={timeMap}
		bind:selected={activeSlide.duration}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
</OptionsBarLayout>
