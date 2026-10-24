<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import Card from '$lib/ui/Card.svelte';
	import type { RecapVerdict } from './context';
	import RecapDot from './RecapDot.svelte';
	import { verdictLabel } from './verdict';

	/**
	 * What the player answered on one slide, set against what was right. The
	 * same card closes a wrong result, fills the recap view, and sits under the
	 * end-of-game grid.
	 *
	 * Answers come as text from the recap, or as a snippet from a result screen
	 * that can render them richer.
	 */
	let {
		verdict,
		answer,
		correctAnswer,
		eyebrow,
		question,
		points,
		footer = false
	}: {
		verdict: RecapVerdict;
		/** Absent when the player gave no answer. */
		answer?: string | Snippet | null;
		/** Shown only when the player's answer was not it. */
		correctAnswer?: string | Snippet | null;
		/** A quiet line above everything, like the question number. */
		eyebrow?: string;
		question?: string;
		/** Absent when the game hides scores. */
		points?: number | null;
		/** Ends the card with the verdict and points, for where no big sign says them. */
		footer?: boolean;
	} = $props();

	let showCorrect = $derived(
		correctAnswer !== undefined && correctAnswer !== null && verdict !== 'Correct'
	);

	// Opinion slides score nothing, so points there would read as a miss.
	let shownPoints = $derived(verdict === 'Recorded' ? undefined : (points ?? undefined));
</script>

{#snippet text(value: string | Snippet)}
	{#if typeof value === 'string'}
		{value}
	{:else}
		{@render value()}
	{/if}
{/snippet}

<Card class="recap-card" padding="0.7em 0.9em" gap="0.5em">
	{#if eyebrow || question}
		<div class="head">
			{#if eyebrow}
				<div class="eyebrow" dir="auto">{eyebrow}</div>
			{/if}
			{#if question}
				<div class="question" dir="auto">{question}</div>
			{/if}
		</div>
	{/if}
	<!-- A missed slide has no answer to show, and some answers have no words,
	     like a pin on a picture; the verdict says enough for both. -->
	{#if verdict !== 'Unanswered' && answer !== undefined && answer !== null}
		<div class="line">
			<RecapDot {verdict} label={verdictLabel(verdict)} />
			<div class="given">
				<div class="tag">{m.your_answer()}</div>
				<div class="value" dir="auto" class:struck={verdict === 'Incorrect'}>
					{@render text(answer)}
				</div>
			</div>
		</div>
	{/if}
	{#if showCorrect && correctAnswer}
		<div class="line">
			<RecapDot verdict="Correct" label={verdictLabel('Correct')} />
			<div class="given">
				<div class="tag">{m.correct_answer()}</div>
				<div class="value" dir="auto">{@render text(correctAnswer)}</div>
			</div>
		</div>
	{/if}
	{#if footer}
		<div class={['footer', verdict.toLowerCase()]}>
			<span class="verdict">{verdictLabel(verdict)}</span>
			{#if shownPoints !== undefined}
				<span class="points">{m.points_earned({ count: shownPoints.toLocaleString(getLocale()) })}</span>
			{/if}
		</div>
	{/if}
</Card>

<style>
	/* Card clips its overflow, which would let a column parent squeeze it down
	   and cut off the answer; the parent scrolls instead. */
	:global(.recap-card) {
		flex-shrink: 0;
		width: min(30em, 100%);
		box-sizing: border-box;
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
	}

	.eyebrow {
		font-size: 0.8em;
		color: var(--on-surface-variant);
		overflow-wrap: anywhere;
	}

	.question {
		font-weight: 600;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}

	.line {
		display: flex;
		align-items: flex-start;
		gap: 0.6em;
		--dot-size: 1.1em;
	}

	/* Centres the dot on the label line above the answer. */
	.line > :global(.dot) {
		margin-block-start: 0.1em;
	}

	.given {
		flex: 1;
		min-width: 0;
	}

	.value {
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.value :global(ol) {
		margin: 0;
		padding-inline-start: 1.4em;
	}

	.struck {
		text-decoration: line-through;
		text-decoration-thickness: 0.08em;
		font-weight: 400;
	}

	.tag {
		font-size: 0.75em;
		color: var(--on-surface-variant);
	}

	.footer {
		display: flex;
		align-items: baseline;
		gap: 0.6em;
		padding-block-start: 0.5em;
		border-block-start: 1px solid var(--outline);
		font-size: 0.85em;
	}

	.verdict {
		font-weight: 700;
	}

	/* The verdict colours are tuned for fills; as small text they are pulled
	   toward the text colour until they read at 4.5:1 on the card in either
	   theme. */
	.correct .verdict {
		color: color-mix(in srgb, var(--correct) 65%, var(--on-surface));
	}

	.incorrect .verdict {
		color: color-mix(in srgb, var(--incorrect) 65%, var(--on-surface));
	}

	.points {
		margin-inline-start: auto;
		color: var(--on-surface-variant);
	}
</style>
