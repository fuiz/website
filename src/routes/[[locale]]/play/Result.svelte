<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Confetti } from 'svelte-confetti';
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
	import type { RecapVerdict } from '$lib/feedback/recap/context';
	import RecapCard from '$lib/feedback/recap/RecapCard.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name,
		score,
		correct,
		questionText,
		answered,
		children,
		correctAnswer
	}: {
		name: string;
		score: number;
		correct: boolean;
		questionText: string;
		/** Whether the player answered before time ran out. */
		answered: boolean;
		/** What the player answered. */
		children: Snippet;
		/** What would have been right, shown only when the player wasn't. */
		correctAnswer?: Snippet;
	} = $props();

	let verdict: RecapVerdict = $derived(correct ? 'Correct' : answered ? 'Incorrect' : 'Unanswered');
</script>

<!-- The verdict leads. A right answer needs only a quiet reminder of what it
     was; a wrong one gets the card setting it against the right one. -->
<PlayerLayout {name} {score} pendingVerdict={verdict}>
	<!-- One group, centred: the sign, then what was answered. A right answer
	     needs only a quiet reminder; anything else gets the card, with the
	     question at its head. -->
	<div class="screen">
		<div class="group">
			<FeedbackSign variant={correct ? 'correct' : answered ? 'wrong' : 'time-up'}>
				{#if correct}
					{m.thats_correct()}
				{:else if answered}
					{m.try_again()}
				{:else}
					{m.unanswered()}
				{/if}
			</FeedbackSign>
			{#if correct}
				<div class="quiet">
					<div class="tag">{m.your_answer()}</div>
					<div dir="auto">{@render children()}</div>
				</div>
			{:else}
				<RecapCard
					{verdict}
					eyebrow={questionText}
					answer={answered ? children : undefined}
					{correctAnswer}
				/>
			{/if}
		</div>
	</div>
	{#if correct}
		<div class="confetti">
			<Confetti
				x={[-5, 5]}
				y={[0, 0.1]}
				delay={[500, 2000]}
				infinite
				duration={5000}
				amount={200}
				size={30}
				fallDistance="100vh"
				disableForReducedMotion={true}
			/>
		</div>
	{/if}
</PlayerLayout>

<style>
	.screen {
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1em;
		overflow-y: auto;
	}

	.group {
		margin: auto 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.2em;
	}

	.quiet {
		text-align: center;
		overflow-wrap: anywhere;
	}

	.tag {
		font-size: 0.75em;
		color: var(--on-surface-variant);
	}

	.quiet :global(ol) {
		margin: 0;
		text-align: start;
	}

	.confetti {
		position: fixed;
		top: 0;
		left: 0;
		height: 100dvh;
		width: 100vw;
		display: flex;
		justify-content: center;
		overflow: hidden;
		pointer-events: none;
		z-index: -1;
	}
</style>
