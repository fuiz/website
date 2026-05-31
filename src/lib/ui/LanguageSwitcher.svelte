<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, type Locale, locales, setLocale } from '$lib/paraglide/runtime.js';
	import Language from '~icons/material-symbols/language';
	import IconButton from './IconButton.svelte';

	let popoverElement = $state<HTMLElement>();

	let { up = false, id }: { up?: boolean; id: string } = $props();

	function handleLanguageSelect(lang: Locale) {
		setLocale(lang);
		popoverElement?.hidePopover();
	}

	function nativeName(loc: string) {
		try {
			return new Intl.DisplayNames([loc], { type: 'language' }).of(loc) ?? loc;
		} catch {
			return loc;
		}
	}
</script>

<div>
	<IconButton alt={m.language()} popovertarget={id}>
		<Language style="anchor-name: --lang-{id}" />
	</IconButton>

	<div {id} bind:this={popoverElement} popover="auto" class:up style:position-anchor="--lang-{id}">
		<ul>
			{#each locales as lang (lang)}
				{@const current = getLocale() === lang}
				<li>
					<button class:current onclick={() => handleLanguageSelect(lang)}>
						{nativeName(lang)}
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
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		padding: 0;
		margin: 0.15em;
		color: inherit;
		inset: unset;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		box-shadow:
			0 1px 2px color-mix(in srgb, var(--on-surface) 8%, transparent),
			0 4px 12px color-mix(in srgb, var(--on-surface) 12%, transparent);
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
		margin: 0;
		padding: 0.3em;
		max-height: 18em;
		overflow: auto;
	}

	li {
		display: block;
	}

	button {
		appearance: none;
		display: flex;
		align-items: center;
		width: 100%;
		text-align: left;
		font: inherit;
		color: inherit;
		background: none;
		border: 1px solid transparent;
		border-radius: 0.4em;
		padding: 0.3em 0.5em;
		line-height: 1.4;
		cursor: pointer;
		white-space: nowrap;
		text-transform: capitalize;
		transition:
			background 100ms cubic-bezier(0.2, 0, 0, 1),
			border-color 100ms cubic-bezier(0.2, 0, 0, 1);
	}

	button:hover {
		background: color-mix(in srgb, var(--on-surface) 8%, transparent);
	}

	button.current {
		border-color: color-mix(in srgb, var(--primary) 60%, transparent);
		color: var(--primary);
	}
</style>
