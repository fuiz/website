<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Card from '$lib/ui/Card.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';

	/**
	 * The question and what the player answered, shown above the verdict so they
	 * can look back at what was asked and what they said. Without an `answer` the
	 * player ran out of time. `correctAnswer` follows when there is one to show.
	 */
	let {
		questionText,
		answer,
		correctAnswer
	}: {
		questionText: string;
		answer?: Snippet;
		correctAnswer?: Snippet;
	} = $props();
</script>

<Card class="answer-recap" padding="0.8em 1em" gap="0.8em">
	{#if questionText}
		<div class="question">{questionText}</div>
	{/if}
	<div class="given">
		<SectionLabel --section-label-margin="0 0 0.3em">{m.your_answer()}</SectionLabel>
		{#if answer}
			<div class="value">{@render answer()}</div>
		{:else}
			<div class="value none">{m.unanswered()}</div>
		{/if}
	</div>
	{#if correctAnswer}
		<div class="given">
			<SectionLabel --section-label-margin="0 0 0.3em">{m.correct_answer()}</SectionLabel>
			<div class="value">{@render correctAnswer()}</div>
		</div>
	{/if}
</Card>

<style>
	/* Card clips its overflow, which would let a column parent squeeze it down
	   and cut off the answer; the parent scrolls instead. */
	:global(.answer-recap) {
		flex-shrink: 0;
		width: min(34em, 100%);
	}

	.question {
		font-size: 1.3em;
		font-weight: 500;
		line-height: 1.35;
		word-break: break-word;
	}

	.value {
		font-weight: 600;
		word-break: break-word;
	}

	.none {
		opacity: 0.7;
	}

	.value :global(ol) {
		margin: 0;
		padding-inline-start: 1.4em;
	}
</style>
