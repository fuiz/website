<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
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
</script>

<div id="sidebar-container">
	<div id="sidebar">
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

	.switch-field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4em;
		padding: 0.4em 0.55em;
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		background: color-mix(in srgb, var(--on-surface) 2%, transparent);
		box-sizing: border-box;
	}

	.switch-label {
		font-size: 0.7em;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.6;
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
