<script lang="ts">
	import { tick } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import History from '~icons/material-symbols/history';
	import Lock from '~icons/material-symbols/lock-outline';
	import type { Recap, RecapVerdict } from './context';
	import RecapDot from './RecapDot.svelte';
	import { verdictLabel } from './verdict';

	/**
	 * The player's finished slides as a labelled pill under the top bar of every
	 * player screen. Tapping a dot, or the label for the latest one, opens that
	 * slide in place of the game. While the player owes an answer the pill is
	 * locked, so looking back can never cost them a question.
	 *
	 * The dots are one stop for the keyboard, stepped through with the arrow
	 * keys, so a long game doesn't stand between a player and the answers.
	 */
	let {
		recap,
		pending
	}: {
		recap: Recap;
		/** The verdict on the slide being shown right now, before it is over. */
		pending?: RecapVerdict;
	} = $props();

	let scroller = $state<HTMLElement>();
	/** The dots themselves, which can grow while the strip around them doesn't. */
	let track = $state<HTMLElement>();
	/** Dots scrolled out of view at the start, for long games. */
	let hidden = $state(0);

	/** Whether the dots run right to left, which flips which end is newest. */
	function rtl() {
		return scroller !== undefined && getComputedStyle(scroller).direction === 'rtl';
	}

	function measure() {
		if (!scroller) return;
		const bounds = scroller.getBoundingClientRect();
		const flipped = rtl();
		hidden = [...scroller.querySelectorAll<HTMLElement>('.dot')].filter((dot) => {
			const rect = dot.getBoundingClientRect();
			return flipped ? rect.left >= bounds.right : rect.right <= bounds.left;
		}).length;
	}

	/** Whether the player has left the strip at its newest end, rather than scrolled back. */
	let atNewest = true;

	// Scrolling right to left runs scrollLeft from 0 down to negative values,
	// so distances are taken whole.
	function onscroll() {
		if (!scroller) return;
		atNewest = Math.abs(scroller.scrollLeft) + scroller.clientWidth >= scroller.scrollWidth - 2;
		measure();
	}

	function showNewest() {
		scroller?.scrollTo({ left: rtl() ? -scroller.scrollWidth : scroller.scrollWidth });
		atNewest = true;
		measure();
	}

	// A new dot brings the strip to the newest end.
	$effect(() => {
		void recap.entries.length;
		void pending;
		tick().then(showNewest);
	});
	// A resize of the strip or of the dots in it, as fonts and the page around
	// it settle, keeps the newest end in view only for a player who hasn't
	// scrolled back to look at older dots.
	$effect(() => {
		if (!scroller || !track) return;
		const observer = new ResizeObserver(() => (atNewest ? showNewest() : measure()));
		observer.observe(scroller);
		observer.observe(track);
		return () => observer.disconnect();
	});

	function open(index: number | undefined) {
		if (recap.locked) return;
		lastOpened = index;
		recap.view(index);
	}

	// Closing the open slide unmounts what had focus; hand it back to the dot
	// that opened it.
	let lastOpened: number | undefined;
	let wasViewing: number | undefined;
	$effect(() => {
		const viewing = recap.viewing;
		if (viewing === undefined && wasViewing !== undefined && lastOpened !== undefined) {
			const index = lastOpened;
			tick().then(() => {
				if (document.activeElement === document.body || document.activeElement === null) {
					scroller?.querySelector<HTMLElement>(`[data-index="${index}"] button`)?.focus();
				}
			});
		}
		wasViewing = viewing;
	});

	let latest = $derived(recap.entries.at(-1)?.index);

	/** The dot the arrow keys last stepped to, which keeps the group's one Tab stop. */
	let focused = $state<number>();

	/** The one dot the Tab key lands on: the last one focused, the open slide, or the newest. */
	let stop = $derived(
		recap.entries.some((entry) => entry.index === focused) ? focused : (recap.viewing ?? latest)
	);

	function onfocusin(event: FocusEvent) {
		const slot = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
		if (slot) focused = Number(slot.dataset.index);
	}

	/** Arrow keys step between dots in reading order, Home and End jump to the ends. */
	function onkeydown(event: KeyboardEvent) {
		if (!scroller) return;
		const dots = [...scroller.querySelectorAll<HTMLElement>('button.dot')];
		const at = dots.indexOf(document.activeElement as HTMLElement);
		if (at === -1) return;
		const forward = rtl() ? 'ArrowLeft' : 'ArrowRight';
		const back = rtl() ? 'ArrowRight' : 'ArrowLeft';
		const to =
			event.key === forward
				? Math.min(at + 1, dots.length - 1)
				: event.key === back
					? Math.max(at - 1, 0)
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? dots.length - 1
							: undefined;
		if (to === undefined) return;
		event.preventDefault();
		dots[to]?.focus();
	}

	function label(number: number, verdict: RecapVerdict) {
		return `${m.question_text()} ${number}: ${verdictLabel(verdict)}`;
	}
</script>

{#if recap.entries.length > 0 || pending !== undefined}
	<div class="row">
		<nav class="pill" class:locked={recap.locked} aria-label={m.recap()}>
			<!-- Nothing to open until a question finishes, so no button to press. -->
			{#if latest === undefined}
				<span class="title">
					<History />
					{m.recap()}
				</span>
			{:else}
				<button
					type="button"
					class="title"
					aria-disabled={recap.locked}
					onclick={() => open(recap.viewing === latest ? undefined : latest)}
				>
					<History />
					{m.recap()}
				</button>
			{/if}
			<!-- The count sits over the faded start of the dots rather than beside
			     them, so its coming and going never changes the strip's width. -->
			<div class="frame">
				{#if hidden > 0}
					<span class="more"><span dir="ltr">+{hidden}</span></span>
				{/if}
			<div
				class="dots"
				class:faded={hidden > 0}
				role="toolbar"
				tabindex="-1"
				aria-label={m.your_answers()}
				bind:this={scroller}
				{onscroll}
				{onkeydown}
				{onfocusin}
			>
				<div class="track" bind:this={track}>
				{#each recap.entries as entry (entry.index)}
					<span class="slot" data-index={entry.index}>
						<RecapDot
							verdict={entry.verdict}
							label={label(entry.number, entry.verdict)}
							selected={recap.viewing === entry.index}
							disabled={recap.locked}
							tabindex={entry.index === stop ? 0 : -1}
							onclick={() => open(recap.viewing === entry.index ? undefined : entry.index)}
						/>
					</span>
				{/each}
				{#if pending !== undefined}
					<span class="slot">
						<RecapDot
							verdict={pending}
							label={`${m.this_question()}: ${verdictLabel(pending)}`}
							current
						/>
					</span>
				{/if}
				</div>
			</div>
			</div>
			<!-- Said in words, not just by dimming, and kept at full strength so it
			     reads while the rest of the pill steps back. -->
			{#if recap.locked}
				<span class="locked-note">
					<Lock aria-hidden="true" />
					{m.recap_answer_first()}
				</span>
			{/if}
		</nav>
	</div>
{/if}

<style>
	/* Takes the page's width and never asks for more: however many dots a long
	   game gathers, they scroll inside the pill rather than widening the page. */
	.row {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.15em 0.5em 0.4em;
		min-width: 0;
		contain: inline-size;
	}

	.pill {
		flex: 0 1 auto;
		display: flex;
		align-items: center;
		gap: 0.35em;
		min-width: 0;
		max-width: 100%;
		padding-block: 0.15em;
		padding-inline: 0.2em 0.5em;
		border: 1px solid var(--outline);
		border-radius: 999px;
	}

	.pill > :global(*) {
		transition: opacity 200ms;
	}

	.pill.locked > :not(.locked-note) {
		opacity: 0.45;
	}

	.locked-note {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.2em;
		font-size: 0.7em;
		font-weight: 700;
	}

	.locked-note :global(svg) {
		width: 1.2em;
		height: 1.2em;
	}

	.title {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25em;
		padding: 0.2em 0.35em;
		border: none;
		border-radius: 999px;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 0.8em;
		font-weight: 700;
		cursor: pointer;
	}

	span.title {
		cursor: default;
	}

	.title[aria-disabled='true'] {
		cursor: not-allowed;
	}

	.title :global(svg) {
		width: 1.2em;
		height: 1.2em;
	}

	.dots {
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		/* Room for the ring around a selected dot and for each dot's hit area,
		   which the scroller would clip. */
		padding: 0.3em;
		--dot-size: 1.15em;
		/* Half the gap, so neighbouring hit areas meet without overlapping. */
		--dot-reach: 0.3em;
	}

	.frame {
		position: relative;
		display: flex;
		min-width: 0;
	}

	/* Earlier dots slide out under the count; the fade says there are more. */
	.dots.faded {
		mask-image: linear-gradient(to right, transparent 1.2em, #000 2.6em);
	}

	.dots.faded:dir(rtl) {
		mask-image: linear-gradient(to left, transparent 1.2em, #000 2.6em);
	}

	.track {
		display: flex;
		gap: 0.6em;
		width: max-content;
	}

	.slot {
		display: inline-flex;
		border-radius: 50%;
	}

	.more {
		position: absolute;
		inset-inline-start: 0;
		top: 50%;
		translate: 0 -50%;
		z-index: 1;
		font-size: 0.7em;
		font-weight: 700;
		color: var(--on-surface-variant);
	}

	/* On a wide screen the game sits in the middle; so does the strip, rather
	   than stranded in a corner. */
	@media (width > 50em) {
		.row {
			justify-content: center;
		}
	}
</style>
