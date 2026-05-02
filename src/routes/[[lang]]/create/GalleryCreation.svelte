<script lang="ts">
	import { resolve } from '$app/paths';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime.js';
	import type { Media } from '$lib/types';
	import IconButton from '$lib/ui/IconButton.svelte';
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
	let shareWrapper = $state<HTMLDivElement>();
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	function showCopied() {
		try {
			copiedPopover?.showPopover({ source: shareWrapper });
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
</script>

<div class="entry">
	<a class="main" href={resolve(localizeHref(`/create?id=${id}`))}>
		<div class="media">
			<MediaContainer {media} fit="cover" />
		</div>
		<div class="info">
			{title}
			<div class="desc">
				{dateToString(new Date(lastEdited))} • {m.slides_count({
					count: slidesCount
				})}
			</div>
		</div>
	</a>
	<div class="panel">
		<IconButton alt={m.host()} onclick={onplay}><SlideshowOutlineSharp height="1em" /></IconButton>
		<IconButton alt={m.delete_confirm()} onclick={ondelete}
			><DeleteOutline height="1em" /></IconButton
		>
		<IconButton alt={m.download()} onclick={ondownload}><Download height="1em" /></IconButton>
		{#if showShare}
			<div bind:this={shareWrapper}>
				<IconButton
					alt={m.share()}
					onclick={() => {
						onshare(showCopied);
					}}><Share height="1em" /></IconButton
				>
				<div bind:this={copiedPopover} popover="manual" class="fuiz-popover" style:position-area="left">{m.copied()}</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.entry {
		--border-color: #a0a0a0;
		background: var(--border-color);

		display: flex;
		max-height: 15ch;
		aspect-ratio: 6 / 5;
		border: 0.15em solid var(--border-color);
		border-radius: 0.7em;
		position: relative;
		overflow: hidden;
		left: 50%;
		transform: translateX(-50%);

		transition:
			background 150ms ease-out,
			border 150ms ease-out;

		& .main {
			transition:
				margin-right 150ms ease-out,
				background 150ms ease-out;
			outline: none;
			background: var(--surface);

			flex: 1;
			z-index: 1;
			color: inherit;
			text-decoration: inherit;
			display: flex;
			flex-direction: column;
			border-radius: 0.6em;
			overflow: hidden;

			& .media {
				width: 100%;
				flex: 1;
				border-bottom: 0.15em solid var(--border-color);

				transition: border-color 150ms ease-out;
				position: relative;
			}

			& .info {
				padding: 0.3em 0.4em;
				font-size: 0.75em;
				word-wrap: break-word;

				& .desc {
					opacity: 0.7;
				}
			}
		}

		& .panel {
			position: absolute;
			right: 0;
			height: 100%;
			z-index: 0;
			color: var(--palette-light);

			display: flex;
			flex-direction: column;
			padding: 0.2em;
			gap: 0.2em;
		}

		&:where(:global(:focus-within, :hover)) {
			background: var(--primary);
			--border-color: var(--primary);

			& .main {
				margin-right: 1.5em;

				&:where(:global(:focus, :hover)) {
					--trans-color: color-mix(in srgb, currentColor 10%, transparent);
					background:
						linear-gradient(var(--trans-color), var(--trans-color)), var(--surface);
				}
			}
		}
	}

	@media (hover: none) {
		.entry {
			--border-color: var(--primary);
		}

		.entry .main {
			outline: none;
			margin-right: 1.5em;
		}
	}
</style>
