<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Confetti } from 'svelte-confetti';
	import AnswerRecap from '$lib/feedback/AnswerRecap.svelte';
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
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
		/** What the player answered, rendered under the question. */
		children: Snippet;
		/** What would have been right, shown only when the player wasn't. */
		correctAnswer?: Snippet;
	} = $props();
</script>

<PlayerLayout {name} {score}>
	<div class="screen">
		<AnswerRecap
			{questionText}
			answer={answered ? children : undefined}
			correctAnswer={correct ? undefined : correctAnswer}
		/>
		<div class="verdict">
			<FeedbackSign variant={correct ? 'correct' : 'wrong'}>
				{#if correct}
					{m.thats_correct()}
				{:else}
					{m.try_again()}
				{/if}
			</FeedbackSign>
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
		gap: 1.5em;
		padding: 1em;
		overflow-y: auto;
	}

	.verdict {
		flex: 1;
		display: flex;
		align-items: safe center;
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
