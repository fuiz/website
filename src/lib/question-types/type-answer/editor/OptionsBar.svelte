<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { pointsMap, timeMap } from '$lib/question-types/editor/optionMaps';
	import type { TypeAnswer } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import Switch from '$lib/ui/Switch.svelte';
	import SportsScore from '~icons/material-symbols/sports-score';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: TypeAnswer;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="type-answer-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.typeAnswer.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="type-answer-limit"
		label={m.time_limit()}
		options={limits.fuiz.typeAnswer.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="type-answer-points"
		label={m.points()}
		options={limits.fuiz.typeAnswer.allowedPointsAwarded}
		map={pointsMap}
		bind:selected={activeSlide.points_awarded}
	>
		{#snippet leading()}<SportsScore height="1em" />{/snippet}
	</OptionsField>
	<div class="switch-field">
		<span class="switch-label">{m.case_sensitive()}</span>
		<Switch bind:checked={activeSlide.case_sensitive} id="case-sensitive" />
	</div>
</OptionsBarLayout>

<style>
	/* A switch isn't an OptionsField, so it brings its own label pairing to sit
	   flush with the fields above it. */
	.switch-field {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		padding: 0.2em 0.1em;
	}

	.switch-label {
		font-size: 0.8em;
		font-family: var(--alternative-font);
		opacity: 0.75;
	}
</style>
