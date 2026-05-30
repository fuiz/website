<script lang="ts">
	import {
		CONTENT_LANGUAGES,
		localizedLanguageName,
		nativeLanguageName
	} from '$lib/contentLanguages';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import SelectTrigger from '$lib/ui/SelectTrigger.svelte';
	import Language from '~icons/material-symbols/language';
	import Search from '~icons/material-symbols/search';

	let {
		value = $bindable(),
		id
	}: {
		value: string;
		id: string;
	} = $props();

	let query = $state('');
	let popoverEl = $state<HTMLElement>();
	let searchInput = $state<HTMLInputElement>();

	let entries = $derived(
		CONTENT_LANGUAGES.map((code) => ({
			code,
			en: localizedLanguageName(code, getLocale()),
			native: nativeLanguageName(code)
		}))
	);

	let filtered = $derived.by(() => {
		const q = query.toLowerCase().trim();
		const matches = q
			? entries.filter(
					(l) =>
						l.en.toLowerCase().includes(q) ||
						l.native.toLowerCase().includes(q) ||
						l.code.toLowerCase().includes(q)
				)
			: entries;
		return [...matches].sort((a, b) => a.en.localeCompare(b.en));
	});

	function pick(code: string) {
		value = code;
		query = '';
		popoverEl?.hidePopover();
	}
</script>

<SelectTrigger
	value={nativeLanguageName(value)}
	ariaLabel={m.language()}
	popovertarget={id}
	anchorName={id}
>
	{#snippet leading()}
		<Language height="1.1em" />
	{/snippet}
</SelectTrigger>

<div
	{id}
	bind:this={popoverEl}
	popover="auto"
	class="popover"
	style:position-anchor="--{id}"
	ontoggle={(e) => {
		if ((e as ToggleEvent).newState === 'open') {
			searchInput?.focus();
		}
	}}
>
	<div class="search">
		<Search height="1.1em" width="1.1em" />
		<input
			bind:this={searchInput}
			type="text"
			placeholder={m.language()}
			bind:value={query}
			autocomplete="off"
		/>
	</div>
	<ul>
		{#each filtered as { code, en, native } (code)}
			<li>
				<button type="button" class:current={value === code} onclick={() => pick(code)}>
					<span class="native">{native}</span>
					{#if en.toLowerCase() !== native.toLowerCase()}
						<span class="english">{en}</span>
					{/if}
				</button>
			</li>
		{:else}
			<li class="empty">{m.no_language_matches({ query })}</li>
		{/each}
	</ul>
</div>

<style>
	.popover {
		position: fixed;
		position-area: bottom span-left;
		background: var(--surface);
		border: 1px solid color-mix(in srgb, var(--on-surface) 20%, transparent);
		border-radius: 0.7em;
		padding: 0;
		margin: 0.3em;
		color: inherit;
		inset: unset;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		min-width: 18em;
	}

	.popover:dir(rtl) {
		position-area: bottom span-right;
	}

	.popover::backdrop {
		background-color: transparent;
	}

	.search {
		display: flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.5em 0.7em;
		border-bottom: 1px solid color-mix(in srgb, var(--on-surface) 15%, transparent);
		color: color-mix(in srgb, var(--on-surface) 60%, transparent);
	}

	.search input {
		appearance: none;
		flex: 1;
		font: inherit;
		color: inherit;
		background: transparent;
		border: none;
		outline: none;
		padding: 0;
		min-width: 0;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0.3em;
		max-height: 20em;
		overflow: auto;
	}

	li {
		display: block;
	}

	li.empty {
		padding: 0.6em 0.5em;
		font-size: 0.85em;
		opacity: 0.6;
		text-align: center;
	}

	button {
		appearance: none;
		display: flex;
		align-items: baseline;
		gap: 0.5em;
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

	.native {
		text-transform: capitalize;
	}

	.english {
		font-size: 0.8em;
		opacity: 0.6;
	}
</style>
