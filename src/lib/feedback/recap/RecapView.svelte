<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import type { RecapEntry } from './context';
	import RecapCard from './RecapCard.svelte';

	/**
	 * A finished slide, shown in place of the game while the strip above stays
	 * put. The arrows step through the others; the player leaves with the
	 * button, or the game takes them back when its next screen arrives.
	 */
	let {
		entry,
		previous,
		next,
		onview,
		onback
	}: {
		entry: RecapEntry;
		previous?: RecapEntry;
		next?: RecapEntry;
		onview: (index: number) => void;
		onback: () => void;
	} = $props();

	let heading = $state<HTMLElement>();

	// The game's screen just gave way to this one; say so to a screen reader by
	// moving there, and again on every step through the recap.
	$effect(() => {
		void entry.index;
		heading?.focus();
	});
</script>

<div class="view">
	<div class="nav">
		<IconButton
			alt={m.prev_slide()}
			disabled={previous === undefined}
			onclick={() => previous && onview(previous.index)}
			padding="0.2em"
		>
			<ChevronLeft height="1.4em" width="1.4em" />
		</IconButton>
		<div class="eyebrow">{m.question_text()} {entry.number}</div>
		<IconButton
			alt={m.next_slide()}
			disabled={next === undefined}
			onclick={() => next && onview(next.index)}
			padding="0.2em"
		>
			<ChevronRight height="1.4em" width="1.4em" />
		</IconButton>
	</div>
	<div class="body">
		<h2 class="question" dir="auto" tabindex="-1" bind:this={heading}>{entry.question}</h2>
		<RecapCard
			verdict={entry.verdict}
			answer={entry.answer}
			correctAnswer={entry.correct_answer}
			points={entry.points}
			footer
		/>
	</div>
	<div class="back">
		<FancyButton palette="ghost" onclick={onback}>
			<div class="back-label">{m.back_to_game()}</div>
		</FancyButton>
	</div>
</div>

<style>
	/* One group in the middle of the screen, the way back right under the card
	   rather than across a tablet's worth of empty space. */
	.view {
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: safe center;
		padding: 0.5em 1em 1em;
		gap: 1em;
		overflow-y: auto;
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: min(30em, 100%);
		margin: 0 auto;
	}

	/* IconButton keeps its look when disabled; an arrow with nowhere to go
	   should not invite a tap. */
	.nav :global(button:disabled) {
		opacity: 0.3;
		cursor: default;
	}

	/* Previous sits on the right in a right-to-left language, so its arrow
	   points right. */
	.nav:dir(rtl) :global(svg) {
		transform: scaleX(-1);
	}

	.eyebrow {
		font-size: 0.8em;
		color: var(--on-surface-variant);
	}

	.body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8em;
	}

	.question {
		margin: 0;
		font-size: 1.3em;
		font-weight: 600;
		line-height: 1.35;
		text-align: center;
		max-width: 30em;
		overflow-wrap: anywhere;
	}

	.question:focus {
		outline: none;
	}

	.back {
		width: min(30em, 100%);
		margin: 0 auto;
	}

	.back-label {
		padding: 0.2em 0.6em;
	}
</style>
