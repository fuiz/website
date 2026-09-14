<script lang="ts">
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import CorrectAnswers from '$lib/question-types/preview/CorrectAnswers.svelte';
	import { type FuizConfig, getTitle } from '$lib/types';
	import Card from '$lib/ui/Card.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';
	import MilitaryTech from '~icons/material-symbols/military-tech';

	type Score = { points: number; position: number } | undefined;

	let {
		score,
		points,
		config
	}: {
		score: Score;
		points: number[];
		config: FuizConfig;
	} = $props();
</script>

<TypicalPage>
	<div id="summary">
		<Card
			padding="0.7em 1em"
			gap="0.7em"
			class={[
				'placement',
				{
					'placement-gold': score?.position === 0,
					'placement-silver': score?.position === 1,
					'placement-bronze': score?.position === 2
				}
			]}
		>
			{#if score}
				{#if score.position < 3}
					<MilitaryTech height="1.7em" width="1.7em" />
				{/if}
				<div class="placement-position">#{score.position + 1}</div>
				<div class="placement-points">{score.points} {m.points()}</div>
			{:else}
				<div class="placement-not-ranked">{m.not_on_leaderboard()}</div>
			{/if}
		</Card>
		<div id="lines">
			{#each config.slides as slide, index (slide.id)}
				{@const correct = (points.at(index) ?? 0) > 0}
				{@const title = getTitle(slide)}
				<div class="line">
					<div class="label">
						<SectionLabel as="span">{m.question_text()} {index + 1}</SectionLabel>
						<span class="status" class:correct class:wrong={!correct}>
							{correct ? m.correct() : m.wrong()}
						</span>
					</div>
					<Card gap="0.5em" padding="0.5em 0.7em">
						<div class="title">{title}</div>
						<div class="answers">
							<SectionLabel --section-label-margin="0 0 0.2em">{m.correct_answers()}</SectionLabel>
							<CorrectAnswers {slide} />
						</div>
					</Card>
				</div>
			{/each}
		</div>
	</div>
</TypicalPage>

<style>
	#summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		gap: 0.8em;
		width: 100%;
		max-width: min(40ch, 90vw);
		padding: 0.4em;
		box-sizing: border-box;
	}

	#summary :global(.placement) {
		flex-direction: row;
		align-items: center;
		font-family: var(--alternative-font);
		color: var(--on-surface);
	}

	#summary :global(.placement-gold) {
		--card-bg: color-mix(in srgb, #d4af37 20%, var(--surface-container));
		color: color-mix(in srgb, #d4af37 70%, var(--on-surface));
	}

	#summary :global(.placement-silver) {
		--card-bg: color-mix(in srgb, #a8a8a8 20%, var(--surface-container));
		color: color-mix(in srgb, #a8a8a8 70%, var(--on-surface));
	}

	#summary :global(.placement-bronze) {
		--card-bg: color-mix(in srgb, #cd7f32 18%, var(--surface-container));
		color: color-mix(in srgb, #cd7f32 70%, var(--on-surface));
	}

	.placement-position {
		font-weight: 800;
		font-size: 1.8em;
		line-height: 1;
		color: var(--on-surface);
	}

	.placement-points {
		font-weight: 700;
		font-size: 0.9em;
		opacity: 0.8;
		color: var(--on-surface);
		margin-inline-start: auto;
	}

	.placement-not-ranked {
		font-weight: 700;
		opacity: 0.7;
	}

	#lines {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
	}

	.line {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	/* Pure layout: the eyebrow's own typography comes from .section-label. */
	.label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5em;
		padding: 0 0.3em;
	}

	.status {
		font-size: 0.75em;
		padding: 0.15em 0.5em;
		border-radius: 999px;
		font-weight: 700;
	}

	.status.correct {
		background: var(--on-surface);
		color: var(--surface);
	}

	.status.wrong {
		background: var(--primary);
		color: var(--on-primary);
	}

	.title {
		font-weight: 600;
		overflow-wrap: anywhere;
	}
</style>
