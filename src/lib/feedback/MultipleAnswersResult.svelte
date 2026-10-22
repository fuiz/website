<script lang="ts">
	import { Confetti } from 'svelte-confetti';
	import type { RecapVerdict } from '$lib/feedback/recap/context';
	import * as m from '$lib/paraglide/messages.js';
	import {
		getMultipleAnswersReview,
		type McqAnswerStatus
	} from '$lib/question-types/mcq/shared/correctness';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { AnswerResult, TextOrMedia } from '$lib/types';
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';
	import HourglassBottom from '~icons/material-symbols/hourglass-bottom';

	let {
		name,
		score,
		questionText,
		answers,
		results,
		answered
	}: {
		name: string;
		score: number;
		questionText: string;
		answers: (TextOrMedia | undefined)[];
		results: AnswerResult[];
		answered: number | number[] | undefined;
	} = $props();

	const review = $derived(getMultipleAnswersReview(answered, results));

	const rows = $derived(
		answers.map((answer, index) => ({
			text: answer?.Text ?? '',
			status: review.statuses[index] ?? 'avoided',
			correct: results[index]?.correct ?? false
		}))
	);

	// The recap's colours, so this screen, its dot, and the recap agree. A missed
	// answer was right but left unpicked, so it is the pale half of correct.
	const CORRECT = 'var(--correct)';
	const PARTIAL = 'color-mix(in srgb, var(--correct) 55%, var(--surface))';

	const statusColor: Record<McqAnswerStatus, string> = {
		found: CORRECT,
		missed: 'var(--on-surface-variant)',
		wrong: 'var(--incorrect)',
		avoided: 'var(--tertiary)'
	};

	const statusTag: Record<McqAnswerStatus, string> = {
		found: m.result_tag_found(),
		missed: m.result_tag_missed(),
		wrong: m.result_tag_wrong(),
		avoided: m.result_tag_avoided()
	};

	const timedOut = $derived(answered === undefined);

	const headline = $derived(
		review.isPerfect
			? m.thats_correct()
			: review.foundCount > 0
				? m.almost()
				: timedOut
					? m.unanswered()
					: m.try_again()
	);

	// big placard mirrors the correct/wrong result screens: pale for partial,
	// neutral when time ran out
	const placardColor = $derived(
		review.isPerfect
			? CORRECT
			: review.foundCount > 0
				? PARTIAL
				: timedOut
					? 'var(--tertiary)'
					: 'var(--incorrect)'
	);

	const verdict: RecapVerdict = $derived(
		review.isPerfect
			? 'Correct'
			: review.foundCount > 0
				? 'Partial'
				: answered === undefined
					? 'Unanswered'
					: 'Incorrect'
	);
</script>

<PlayerLayout {name} {score} pendingVerdict={verdict}>
	<div class="review">
		<div class="group">
		<header>
			<div class="placard" class:partial={verdict === 'Partial'} style:--c={placardColor}>
				{#if review.foundCount > 0}<Check />{:else if timedOut}<HourglassBottom />{:else}<Close />{/if}
			</div>
			<div class="lead">{headline}</div>
		</header>

		{#if questionText}
			<div class="question" dir="auto">{questionText}</div>
		{/if}
		<ul class="list">
			{#each rows as row, index (index)}
				<li class="row" class:dim={row.status === 'avoided'} style:--c={statusColor[row.status]}>
					<div class="badge">
						{#if row.correct}<Check />{:else}<Close />{/if}
					</div>
					<span class="text" dir="auto">{row.text}</span>
					<span class="tag">{statusTag[row.status]}</span>
				</li>
			{/each}
		</ul>
		</div>
	</div>

	{#if review.isPerfect}
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
	.review {
		height: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25em;
		padding: 1em;
		overflow-y: auto;
	}

	.group {
		margin: auto 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6em;
	}

	header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6em;
		margin-block-end: 0.6em;
	}

	.placard {
		display: grid;
		place-items: center;
		width: 6em;
		height: 6em;
		border-radius: 1.5rem;
		background: var(--c);
		color: #fff;
	}

	.placard.partial {
		color: var(--on-surface);
	}

	.question {
		color: var(--on-surface-variant);
		text-align: center;
		overflow-wrap: anywhere;
	}

	.placard :global(svg) {
		width: 3.6em;
		height: 3.6em;
	}

	.lead {
		font-size: 1.9em;
		font-weight: bold;
	}

	.list {
		width: min(30em, 100%);
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.7em;
		padding: 0.6em 0.8em;
		border-radius: 0.8em;
		border: 0.15em solid color-mix(in srgb, var(--c) 55%, transparent);
		background: color-mix(in srgb, var(--c) 8%, var(--surface));
	}

	.row.dim {
		opacity: 0.7;
		border-style: dashed;
	}

	.row .text {
		flex: 1;
		font-weight: 600;
	}

	.row .tag {
		font-family: var(--alternative-font);
		font-size: 0.75em;
		font-weight: 600;
		color: var(--c);
		max-width: 6em;
		text-align: end;
	}

	.badge {
		flex: none;
		width: 1.7em;
		height: 1.7em;
		border-radius: 0.5em;
		display: grid;
		place-items: center;
		background: var(--c);
		color: #fff;
	}

	.badge :global(svg) {
		width: 1.1em;
		height: 1.1em;
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
