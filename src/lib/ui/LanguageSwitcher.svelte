<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { type Locale, locales, setLocale } from '$lib/paraglide/runtime.js';
	import Language from '~icons/material-symbols/language';
	import IconButton from './IconButton.svelte';

	let popoverElement = $state<HTMLElement>();

	let { up = false, id }: { up?: boolean; id: string } = $props();

	function handleLanguageSelect(lang: Locale) {
		setLocale(lang);
		popoverElement?.hidePopover();
	}
</script>

<div>
	<IconButton alt={m.language()} popovertarget={id}>
		<Language style="anchor-name: --lang-{id}" />
	</IconButton>

	<div {id} bind:this={popoverElement} popover="auto" class:up style:position-anchor="--lang-{id}">
		<ul>
			{#each locales as lang (lang)}
				<li>
					<!-- the hreflang attribute decides which language the link points to -->
					<button onclick={() => handleLanguageSelect(lang)}>
						{new Intl.DisplayNames([lang], {
							type: 'language'
						}).of(lang)}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	[popover] {
		position: fixed;
		position-area: bottom span-left;
		background: var(--surface);
		border: 0.1em solid;
		border-radius: 0.7em;
		padding: 0;
		margin: 0.15em;
		color: inherit;
		inset: unset;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
	}

	[popover].up {
		position-area: top span-left;
	}

	[popover]:dir(rtl) {
		position-area: bottom span-right;
	}

	[popover]:dir(rtl).up {
		position-area: top span-right;
	}

	[popover]::backdrop {
		background-color: transparent;
	}

	ul {
		list-style: none;
		padding: 0.3em;
		margin: 0;
	}

	li {
		display: block;
		text-transform: capitalize;
		padding: 0.3em 0.3em;
		line-height: 1.25;
		white-space: nowrap;
	}

	button {
		color: inherit;
		background: none;
		border: none;
		font: inherit;
		cursor: pointer;
		text-decoration: none;
	}
</style>
