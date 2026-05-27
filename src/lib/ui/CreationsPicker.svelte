<script lang="ts">
	import { resolve } from '$app/paths';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime.js';
	import type { Creation } from '$lib/types';
	import { toSorted } from '$lib/util';
	import NoteAddOutline from '~icons/material-symbols/note-add-outline';

	let {
		creations,
		href
	}: {
		creations: Creation[];
		href: (id: number) => string;
	} = $props();

	let sorted = $derived(toSorted(creations, (a, b) => b.lastEdited - a.lastEdited));

	const sameYear: { month: 'short'; day: 'numeric' } = { month: 'short', day: 'numeric' };
	const diffYear: { year: 'numeric'; month: 'numeric'; day: 'numeric' } = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	};

	function dateToString(date: Date): string {
		const now = new Date();
		return date.toLocaleDateString(
			getLocale(),
			now.getFullYear() === date.getFullYear() ? sameYear : diffYear
		);
	}
</script>

{#if sorted.length > 0}
	<div class="grid">
		{#each sorted as { id, title, lastEdited, slidesCount, media } (id)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a class="tile" href={href(id)}>
				<div class="media">
					<MediaContainer {media} fit="cover" />
				</div>
				<div class="info">
					<div class="title">{title}</div>
					<div class="desc">
						{dateToString(new Date(lastEdited))} · {m.slides_count({ count: slidesCount })}
					</div>
				</div>
			</a>
		{/each}
	</div>
{:else}
	<a class="empty" href={resolve(localizeHref('/create'))}>
		<NoteAddOutline height="min(8vh, 24vw)" width="min(8vh, 24vw)" />
		<span>{m.start_blank()}</span>
	</a>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18ch, 1fr));
		grid-auto-rows: 1fr;
		gap: 0.5em;
		width: 100%;
	}

	.tile {
		--border-color: color-mix(in srgb, currentColor 25%, transparent);
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border-color);
		border-radius: 0.6em;
		overflow: hidden;
		color: inherit;
		text-decoration: inherit;
		aspect-ratio: 6 / 5;
		transition:
			border-color 150ms ease-out,
			background 150ms ease-out;
	}

	.tile:where(:hover, :focus-visible) {
		--border-color: var(--primary);
		outline: none;
	}

	.media {
		flex: 1;
		position: relative;
	}

	.info {
		padding: 0.3em 0.4em;
		font-size: 0.75em;
		word-wrap: break-word;
	}

	.desc {
		opacity: 0.7;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		width: 100%;
		padding: 2em 1em;
		box-sizing: border-box;
		font-family: var(--alternative-font);
		font-size: 1.1em;
		color: inherit;
		text-decoration: none;
		background: none;
		border: 2px dashed color-mix(in srgb, currentColor 30%, transparent);
		border-radius: 0.7em;
		opacity: 0.7;
		transition:
			opacity 150ms ease-out,
			border-color 150ms ease-out,
			background 150ms ease-out;
	}

	.empty:where(:hover, :focus-visible) {
		opacity: 1;
		border-color: var(--primary);
		background: color-mix(in srgb, var(--primary) 8%, transparent);
		outline: none;
	}
</style>
