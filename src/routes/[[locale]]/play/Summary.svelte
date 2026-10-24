<script lang="ts">
	import type { RecapEntry } from '$lib/feedback/recap/context';
	import RecapCard from '$lib/feedback/recap/RecapCard.svelte';
	import RecapDot from '$lib/feedback/recap/RecapDot.svelte';
	import { verdictLabel } from '$lib/feedback/recap/verdict';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import CorrectAnswers from '$lib/question-types/preview/CorrectAnswers.svelte';
	import { type FuizConfig, getPointsAwarded, getTitle } from '$lib/types';
	import Card from '$lib/ui/Card.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';
	import MilitaryTech from '~icons/material-symbols/military-tech';

	type Score = { points: number; position: number } | undefined;

	/**
	 * The end of the game: the player's placing, then the recap strip grown into
	 * a grid, with the tapped slide's card beneath it.
	 */
	let {
		score,
		recap,
		points,
		config
	}: {
		score: Score;
		recap: RecapEntry[];
		/** Points earned on each slide, from the summary itself. */
		points: number[];
		config: FuizConfig;
	} = $props();

	/**
	 * The recap as the summary alone can tell it, for a player whose recap never
	 * arrived: points say which questions scored, though not what was answered.
	 */
	function fromPoints(): RecapEntry[] {
		let number = 0;
		return config.slides.flatMap((slide, index) => {
			if ('InfoSlide' in slide) return [];
			number += 1;
			const graded = getPointsAwarded(slide) > 0;
			const earned = points.at(index) ?? 0;
			return [
				{
					index,
					number,
					question: getTitle(slide),
					graded,
					verdict: graded ? (earned > 0 ? 'Correct' : 'Incorrect') : 'Recorded',
					// A game without a leaderboard sends 0 or 1, not points.
					points: score ? earned : undefined
				} satisfies RecapEntry
			];
		});
	}

	let entries = $derived(recap.length > 0 ? recap : fromPoints());

	// Open on the first miss, the slide most worth a second look. A skipped
	// poll is not a miss.
	let chosen = $state<number>();
	let selected = $derived(
		entries.find((entry) => entry.index === chosen) ??
			entries.find(
				(entry) => entry.graded && (entry.verdict === 'Incorrect' || entry.verdict === 'Unanswered')
			) ??
			entries[0]
	);

	// Where the recap has no words for the right answer, like a pin's target or
	// a recap that never arrived, the quiz itself can show it.
	let selectedSlide = $derived(selected && config.slides.at(selected.index));

	// Opinion slides have nothing to get right, so they sit outside the count.
	let graded = $derived(entries.filter((entry) => entry.graded));
	let correctCount = $derived(graded.filter((entry) => entry.verdict === 'Correct').length);
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
				<div class="placement-points">{score.points.toLocaleString(getLocale())} {m.points()}</div>
			{:else}
				<div class="placement-not-ranked">{m.not_on_leaderboard()}</div>
			{/if}
		</Card>
		{#if entries.length > 0}
			<SectionLabel --section-label-padding="0 0.3em">
				{m.your_answers()}
				{#snippet trailing()}
					{#if graded.length > 0}
						<span class="score-line">
							{m.recap_score({ correct: correctCount, total: graded.length })}
						</span>
					{/if}
				{/snippet}
			</SectionLabel>
			<div class="grid">
				{#each entries as entry (entry.index)}
					<RecapDot
						verdict={entry.verdict}
						number={entry.number}
						label={`${m.question_text()} ${entry.number}: ${verdictLabel(entry.verdict)}`}
						selected={selected?.index === entry.index}
						onclick={() => (chosen = entry.index)}
					/>
				{/each}
			</div>
			{#if selected}
				<div class="chosen">
					{#snippet fullCorrectAnswer()}
						{#if selectedSlide}
							<CorrectAnswers slide={selectedSlide} />
						{/if}
					{/snippet}
					<RecapCard
						verdict={selected.verdict}
						eyebrow={`${m.question_text()} ${selected.number}`}
						question={selected.question}
						answer={selected.answer}
						correctAnswer={selected.correct_answer ??
							(selected.graded && selectedSlide ? fullCorrectAnswer : undefined)}
						points={selected.points}
						footer
					/>
				</div>
			{/if}
		{/if}
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

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2.6em, 1fr));
		gap: 0.45em;
		padding: 0.2em;
		--dot-size: 100%;
		--dot-height: 2.6em;
		--dot-radius: 0.5em;
		--dot-reach: 0;
	}

	/* Sits in the label's line, so it borrows the label's case and spacing but
	   not its faintness. */
	.score-line {
		text-transform: none;
		letter-spacing: normal;
		font-weight: 700;
	}

	.chosen {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}

	.chosen :global(.recap-card) {
		width: 100%;
	}
</style>
