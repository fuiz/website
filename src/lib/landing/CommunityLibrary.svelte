<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import LibraryBooks from '~icons/material-symbols/library-books';
	import LibraryTile from './LibraryTile.svelte';
	import ShowcaseButton from './ShowcaseButton.svelte';
	import ShowcaseText from './ShowcaseText.svelte';

	// "Community Driven": a shelf of the library, its quizzes drawn as the
	// library shows them, each on a different subject. On a phone only the
	// middle three fit.
	let { showLibrary }: { showLibrary: boolean } = $props();

	const subjects = ['music', 'leaf', 'globe', 'flask', 'atom'] as const;
</script>

<section class="community">
	<ShowcaseText center title={m.community_made()} description={m.community_made_desc()}>
		{#if showLibrary}
			<ShowcaseButton
				href={resolve(localizeHref('/library'))}
				icon={LibraryBooks}
				label={m.library()}
			/>
		{/if}
	</ShowcaseText>
	<div class="shelf" aria-hidden="true">
		{#each subjects as subject, i (subject)}
			<div class="place" class:outer={i === 0 || i === subjects.length - 1}>
				<LibraryTile {subject} />
			</div>
		{/each}
	</div>
</section>

<style>
	.community {
		display: grid;
		justify-items: center;
		gap: 3em;
		max-width: 64em;
		margin: auto;
		padding: 5em 1.5em;
	}

	@media (width <= 50em) {
		.community {
			padding-block: 4em;
		}
	}

	.shelf {
		display: flex;
		gap: 1em;
		font-size: min(1.8em, 2.9vw);
	}

	.place {
		display: flex;
	}

	@media (width <= 40em) {
		.shelf {
			font-size: min(1.8em, 5vw);
		}

		.place.outer {
			display: none;
		}
	}
</style>
