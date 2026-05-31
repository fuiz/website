<script lang="ts">
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import CorrectAnswers from '$lib/question-types/preview/CorrectAnswers.svelte';
	import { type FuizConfig, getTitle } from '$lib/types';
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
		<div
			class="placement"
			class:placement-gold={score?.position === 0}
			class:placement-silver={score?.position === 1}
			class:placement-bronze={score?.position === 2}
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
		</div>
		<div id="lines">
			{#each config.slides as slide, index (slide.id)}
				{@const correct = (points.at(index) ?? 0) > 0}
				{@const title = getTitle(slide)}
				<div class="line">
					<div class="label">
						<span class="num">{m.question_text()} {index + 1}</span>
						<span class="status" class:correct class:wrong={!correct}>
							{correct ? m.correct() : m.wrong()}
						</span>
					</div>
					<div class="card">
						<div class="title">{title}</div>
						<div class="answers">
							<div class="answers-label">{m.correct_answers()}</div>
							<CorrectAnswers {slide} />
						</div>
					</div>
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

	.placement {
		display: flex;
		align-items: center;
		gap: 0.7em;
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		background: var(--surface);
		padding: 0.7em 1em;
		font-family: var(--alternative-font);
		color: var(--on-surface);
	}

	.placement-gold {
		border-color: color-mix(in srgb, #d4af37 55%, transparent);
		background: color-mix(in srgb, #d4af37 12%, var(--surface));
		color: #8a6b00;
	}

	.placement-silver {
		border-color: color-mix(in srgb, #a8a8a8 55%, transparent);
		background: color-mix(in srgb, #a8a8a8 12%, var(--surface));
		color: #5e5e5e;
	}

	.placement-bronze {
		border-color: color-mix(in srgb, #cd7f32 45%, transparent);
		background: color-mix(in srgb, #cd7f32 10%, var(--surface));
		color: #8b4513;
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

	.label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5em;
		padding: 0 0.3em;
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
	}

	.num {
		font-family: var(--alternative-font);
		font-weight: 800;
	}

	.status {
		padding: 0.15em 0.5em;
		border-radius: 999px;
		font-weight: 700;
		text-transform: none;
		letter-spacing: 0;
	}

	.status.correct {
		background: var(--on-surface);
		color: var(--surface);
	}

	.status.wrong {
		background: var(--primary);
		color: var(--on-primary);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		background: var(--surface);
		padding: 0.5em 0.7em;
	}

	.title {
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.answers {
		border-top: 1px solid color-mix(in srgb, var(--on-surface) 12%, transparent);
		padding-top: 0.4em;
	}

	.answers-label {
		font-size: 0.7em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.6;
		font-family: var(--alternative-font);
		font-weight: 800;
		margin-bottom: 0.2em;
	}

</style>
