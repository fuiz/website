<script lang="ts">
	import { resolve } from '$app/paths';
	import { longPress } from '$lib/longPress';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime.js';
	import type { Media } from '$lib/types';
	import Card from '$lib/ui/Card.svelte';
	import type { OverflowItem } from '$lib/ui/OverflowMenu.svelte';
	import OverflowMenu from '$lib/ui/OverflowMenu.svelte';
	import RegularCheckbox from '$lib/ui/regular-checkbox.svelte';
	import BarChart from '~icons/material-symbols/bar-chart';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import Download from '~icons/material-symbols/download';
	import Share from '~icons/material-symbols/share';
	import SlideshowOutlineSharp from '~icons/material-symbols/slideshow-outline-sharp';

	let {
		id,
		title,
		lastEdited,
		slidesCount,
		media,
		reportCount = 0,
		selected = false,
		selecting = false,
		ontoggle,
		ondelete,
		onplay,
		ondownload,
		onshare,
		showShare
	}: {
		id: number;
		title: string;
		lastEdited: number;
		slidesCount: number;
		media: Media | undefined;
		reportCount?: number;
		selected?: boolean;
		/** True once anything is selected, so every card keeps its checkbox visible. */
		selecting?: boolean;
		ontoggle: () => void;
		ondelete: () => void;
		onplay: () => void;
		ondownload: () => void;
		onshare: (showCopied: () => void) => void;
		showShare?: boolean;
	} = $props();

	const same_year: { month: 'short'; day: 'numeric' } = { month: 'short', day: 'numeric' };
	const diff_year: { year: 'numeric'; month: 'numeric'; day: 'numeric' } = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	};

	function dateToString(date: Date): string {
		let currentDate = new Date();
		if (currentDate.getFullYear() === date.getFullYear()) {
			return date.toLocaleDateString(getLocale(), same_year);
		} else {
			return date.toLocaleDateString(getLocale(), diff_year);
		}
	}

	let copiedPopover = $state<HTMLDivElement>();
	let menuWrap = $state<HTMLDivElement>();
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	function showCopied() {
		try {
			copiedPopover?.showPopover({ source: menuWrap });
		} catch {
			/* already shown */
		}
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => {
			try {
				copiedPopover?.hidePopover();
			} catch {
				/* already hidden */
			}
		}, 1500);
	}

	let quizHref = $derived(resolve(localizeHref(`/quiz/${id}`)));

	let items = $derived<OverflowItem[]>([
		{ label: m.host(), icon: SlideshowOutlineSharp, onclick: onplay },
		...(showShare ? [{ label: m.share(), icon: Share, onclick: () => onshare(showCopied) }] : []),
		{ label: m.download(), icon: Download, onclick: ondownload },
		{ label: m.delete_confirm(), icon: DeleteOutline, danger: true, onclick: ondelete }
	]);
</script>

<Card padding="0" {selected}>
	<div class="entry">
		{#if reportCount > 0}
			<span class="report-chip" title={m.reports_count({ count: reportCount })}>
				<BarChart height="0.9em" width="0.9em" />
				{reportCount}
			</span>
		{/if}

		<!-- Both controls sit outside `.main`, which is itself an anchor. -->
		<button
			class="select"
			class:shown={selecting || selected}
			onclick={ontoggle}
			aria-pressed={selected}
			aria-label={m.select_item({ title })}
		>
			<RegularCheckbox checked={selected} />
		</button>

		<a class="main" href={quizHref} use:longPress={{ onlongpress: ontoggle }}>
			<MediaContainer {media} fit="cover" />
		</a>

		<!--
			The footer is a row rather than part of the anchor so the menu can sit at its top
			right; a button cannot live inside `<a>`. The text keeps its own link to the same
			place, out of the tab order so the card is still one stop.
		-->
		<div class="foot">
			<a class="foot-text" href={quizHref} tabindex="-1" use:longPress={{ onlongpress: ontoggle }}>
				{title}
				<span class="desc">
					{dateToString(new Date(lastEdited))} • {m.slides_count({ count: slidesCount })}
				</span>
			</a>
			<div class="menu-slot" bind:this={menuWrap}>
				<OverflowMenu id="quiz-menu-{id}" label={m.options()} {items} />
				<div bind:this={copiedPopover} popover="manual" class="fuiz-popover copied-popover">
					{m.copied()}
				</div>
			</div>
		</div>
	</div>
</Card>

<style>
	.entry {
		display: flex;
		flex-direction: column;
		max-height: 22ch;
		/* A long press would otherwise start a text selection and raise the iOS link
		   callout. `manipulation` keeps vertical scrolling but drops the double-tap
		   delay, so the press timer is not competing with it. */
		user-select: none;
		-webkit-touch-callout: none;
		touch-action: manipulation;
		aspect-ratio: 6 / 5;
		position: relative;
		transition: background 120ms ease-out;
	}

	/* The card is a plain box, since its links and menu live inside it, so the entry
	   gives the hover feedback a link card would. */
	.entry:where(:global(:focus-within, :hover)) {
		background: color-mix(in srgb, var(--on-surface) 7%, transparent);
	}

	.entry:has(.main:focus-visible) {
		outline: 2px solid var(--primary);
		outline-offset: -2px;
	}

	/*
	 * Only the top corners, and the inner radius rather than the outer one: the card
	 * clips its content at its radius minus its 1px border. Matching that means the
	 * artwork paints its own antialiased curve exactly where the border's inner edge
	 * sits, instead of being hard-clipped a pixel away, which would leave a seam of
	 * card background blended into the image.
	 */
	.main {
		flex: 1;
		min-height: 0;
		position: relative;
		display: block;
		border-radius: calc(var(--card-radius, 0.7em) - 1px) calc(var(--card-radius, 0.7em) - 1px) 0 0;
		overflow: hidden;
		outline: none;
	}

	/* `flex-start` is what puts the menu at the top of the strip rather than the bottom. */
	.foot {
		display: flex;
		align-items: flex-start;
		gap: 0.2em;
		padding: 0.3em 0.15em 0.3em 0.4em;
		min-width: 0;
	}

	.foot-text {
		flex: 1;
		min-width: 0;
		font-size: 0.75em;
		color: inherit;
		text-decoration: inherit;
		outline: none;
		overflow-wrap: anywhere;
	}

	.desc {
		display: block;
		opacity: 0.7;
	}

	.menu-slot {
		position: relative;
		flex: 0 0 auto;
	}

	.report-chip {
		position: absolute;
		top: 0.35em;
		left: 0.35em;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 0.2em;
		padding: 0.15em 0.4em;
		border-radius: 999px;
		background: var(--on-surface);
		color: var(--surface);
		font-size: 0.7em;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.select {
		position: absolute;
		top: 0.35em;
		right: 0.35em;
		z-index: 3;
		display: flex;
		padding: 0.2em;
		border: none;
		border-radius: 0.3em;
		background: color-mix(in srgb, var(--surface) 85%, transparent);
		color: inherit;
		font: inherit;
		cursor: pointer;
		opacity: 0;
		transition: opacity 120ms ease-out;
	}

	.select.shown,
	.entry:where(:global(:hover, :focus-within)) .select {
		opacity: 1;
	}

	.copied-popover {
		position-area: left;
	}
</style>
