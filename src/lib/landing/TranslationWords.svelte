<script lang="ts">
	import { nativeLanguageName } from '$lib/contentLanguages';
	import { chooseLocale } from '$lib/localeStrategies';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, locales } from '$lib/paraglide/runtime';
	import { LocaleCycle } from './localeCycle.svelte';
	import TranslatedTitle from './TranslatedTitle.svelte';

	// "Well Translated", shown rather than claimed: the title steps through
	// every language Fuiz ships in, and the languages are a line of plain words
	// underneath, the one on show in full ink. Pointing at one holds the title
	// in it; choosing one switches the site to it.
	const cycle = new LocaleCycle();
	const current = getLocale();
	const count = locales.length.toLocaleString(current);
</script>

<section class="words" {@attach cycle.run}>
	<TranslatedTitle center shown={cycle.shown} />
	<p>{m.well_translated_desc({ count })}</p>
	<ul>
		{#each locales as locale (locale)}
			<li>
				<button
					type="button"
					class:shown={locale === cycle.shown}
					aria-current={locale === current}
					lang={locale}
					onclick={() => chooseLocale(locale)}
					{...cycle.preview(locale)}
				>
					{nativeLanguageName(locale)}
				</button>
			</li>
		{/each}
	</ul>
</section>

<style>
	.words {
		display: grid;
		justify-items: center;
		gap: 0.8em;
		max-width: 40em;
		margin: auto;
		padding: 5em 1.5em;
		text-align: center;
	}

	@media (width <= 50em) {
		.words {
			padding-block: 4em;
		}
	}

	p {
		margin: 0;
		max-width: 38ch;
		font-size: 1.1em;
		line-height: 1.4;
		opacity: 0.8;
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3em 1.2em;
		margin: 1.6em 0 0;
		padding: 0;
		list-style: none;
	}

	button {
		padding: 0;
		border: none;
		background: none;
		font: inherit;
		font-weight: 600;
		/* A set line height, so a name drawn from a taller fallback font, like
		   Arabic, doesn't make its line taller than the rest. */
		line-height: 1.3;
		/* Faint as a solid mix rather than see-through, so joined scripts don't
		   darken where their letters overlap. */
		color: color-mix(in srgb, var(--on-surface) 45%, var(--surface));
		cursor: pointer;
		transition: color 300ms ease-out;
	}

	button.shown {
		color: var(--on-surface);
	}

	button[aria-current='true'] {
		text-decoration: underline 0.12em;
		text-underline-offset: 0.3em;
	}
</style>
