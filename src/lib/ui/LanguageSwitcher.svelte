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
		<Language height="1em" />
	</IconButton>

	<div {id} bind:this={popoverElement} popover="auto" style:--y={up ? 'calc(-100% - 1.25em)' : '0'}>
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
	div {
		position: relative;
	}

	[popover] {
		position: absolute;
		background: var(--background-color);
		border: 0.1em solid;
		border-radius: 0.7em;
		transform-origin: top;
		padding: 0;
		transform: translateX(calc(-100% + 1.25em)) translateY(var(--y));
		margin: 0.15em 0;
		color: inherit;
		inset: unset;
	}

	[popover]:dir(rtl) {
		transform: translateX(calc(100% - 1.25em)) translateY(var(--y));
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
