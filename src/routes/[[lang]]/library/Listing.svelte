<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { localizedLanguageName, nativeLanguageName } from '$lib/contentLanguages';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { PublishedFuiz } from '$lib/types';
	import { grades, subjects } from '$lib/types';
	import Chip from '$lib/ui/Chip.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import { debounce } from '$lib/util';
	import GhostIcon from '~icons/custom/ghost';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import Search from '~icons/material-symbols/search';
	import OnlinePublised from './OnlinePublised.svelte';

	let {
		recentlyPublished,
		availableLanguages
	}: {
		recentlyPublished: PublishedFuiz[];
		availableLanguages: string[];
	} = $props();

	let searchTerm = $state('');

	let results = $state<Promise<PublishedFuiz[] | undefined>>();

	const search = debounce(() => {
		results = fetch('library/search', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				term: searchTerm,
				subjects: subjectsList,
				grades: gradesList,
				languages: languagesList
			})
		})
			.then((res) => (res.ok ? res.json() : undefined))
			.catch(() => undefined);
	}, 500);

	let subjectsSelected = $state(subjects.map((subject) => ({ name: subject, selected: false })));

	let gradesSelected = $state(grades.map((grade) => ({ name: grade, selected: false })));

	let selectedLanguages = new SvelteSet<string>();
	let langQuery = $state('');

	let languageEntries = $derived(
		availableLanguages.map((code) => ({
			code,
			label: localizedLanguageName(code, getLocale()),
			native: nativeLanguageName(code)
		}))
	);

	let filteredLanguages = $derived.by(() => {
		const q = langQuery.toLowerCase().trim();
		const matches = q
			? languageEntries.filter(
					(l) =>
						l.label.toLowerCase().includes(q) ||
						l.native.toLowerCase().includes(q) ||
						l.code.toLowerCase().includes(q)
				)
			: languageEntries;
		return [...matches].sort((a, b) => a.label.localeCompare(b.label));
	});

	let subjectsList = $derived(
		subjectsSelected.filter((subject) => subject.selected).map((subject) => subject.name)
	);
	let gradesList = $derived(
		gradesSelected.filter((grade) => grade.selected).map((grade) => grade.name)
	);
	let languagesList = $derived([...selectedLanguages]);

	let searchCriteria = $derived(
		subjectsList.length + gradesList.length + languagesList.length + searchTerm.length
	);

	let isSearching = $derived(searchCriteria > 0);

	function toggleLanguage(code: string) {
		if (selectedLanguages.has(code)) {
			selectedLanguages.delete(code);
		} else {
			selectedLanguages.add(code);
		}
	}

	$effect(() => {
		if (searchCriteria > 0) {
			results = new Promise(() => {});
			untrack(search);
		} else {
			results = undefined;
		}
	});
</script>

<div class="page">
	<header class="hero">
		<h1>{m.library()}</h1>
		<p class="tagline">{m.community_made_desc()}</p>
		<div class="search">
			<Textfield
				id="search"
				required={false}
				disabled={false}
				bind:value={searchTerm}
				placeholder={m.search()}
			/>
		</div>
	</header>

	<div class="main-view">
		<aside class="filters">
			<details class="filter-group">
				<summary>
					<span class="chevron"><ChevronRight height="1.1em" /></span>
					<span class="filter-name">{m.grade()}</span>
					{#if gradesList.length}
						<span class="badge">{gradesList.length}</span>
					{/if}
				</summary>
				<div class="chip-filter">
					{#each gradesSelected as grade, i (grade.name)}
						<Chip
							size="sm"
							selected={grade.selected}
							onclick={() => (gradesSelected[i].selected = !grade.selected)}
						>
							{grade.name}
						</Chip>
					{/each}
				</div>
			</details>
			<details class="filter-group">
				<summary>
					<span class="chevron"><ChevronRight height="1.1em" /></span>
					<span class="filter-name">{m.subject()}</span>
					{#if subjectsList.length}
						<span class="badge">{subjectsList.length}</span>
					{/if}
				</summary>
				<div class="chip-filter">
					{#each subjectsSelected as subject, i (subject.name)}
						<Chip
							size="sm"
							selected={subject.selected}
							onclick={() => (subjectsSelected[i].selected = !subject.selected)}
						>
							{subject.name}
						</Chip>
					{/each}
				</div>
			</details>
			<details class="filter-group">
				<summary>
					<span class="chevron"><ChevronRight height="1.1em" /></span>
					<span class="filter-name">{m.language()}</span>
					{#if languagesList.length}
						<span class="badge">{languagesList.length}</span>
					{/if}
				</summary>
				<div class="lang-filter">
					{#if availableLanguages.length === 0}
						<div class="lang-empty">{m.nothing()}</div>
					{:else}
						{#if availableLanguages.length > 8}
							<div class="lang-search">
								<Search height="1em" width="1em" />
								<input
									type="text"
									placeholder={m.search()}
									bind:value={langQuery}
									autocomplete="off"
								/>
							</div>
						{/if}
						<div class="lang-chips">
							{#each filteredLanguages as { code, label } (code)}
								<Chip
									size="sm"
									selected={selectedLanguages.has(code)}
									onclick={() => toggleLanguage(code)}
								>
									{label}
								</Chip>
							{:else}
								<div class="lang-empty">
									{m.no_language_matches({ query: langQuery })}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</details>
		</aside>

		<section class="results">
			{#await results}
				<div class="results-heading">
					<span>{isSearching ? m.search() : m.recent_fuizzes()}</span>
				</div>
				<div class="state">
					<div class="spinner"><LoadingCircle /></div>
				</div>
			{:then results}
				{@const list = isSearching ? (results ?? []) : recentlyPublished}
				<div class="results-heading">
					<span>{isSearching ? m.search() : m.recent_fuizzes()}</span>
					{#if list.length}
						<span class="count">{list.length}</span>
					{/if}
				</div>
				{#if list.length}
					<div class="grid">
						{#each list as fuiz (fuiz.storage_id)}
							<OnlinePublised data={fuiz} />
						{/each}
					</div>
				{:else}
					<div class="state empty">
						<GhostIcon
							height="min(20vh, 60vw)"
							width="min(20vh, 60vw)"
							title={m.nothing()}
						/>
						<div>{m.nothing()}</div>
					</div>
				{/if}
			{/await}
		</section>
	</div>
</div>

<style>
	.page {
		max-width: 90ch;
		margin: 0 auto;
		padding: 0 0.6em 2em;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6em;
		padding: 2em 0 1.5em;
		text-align: center;
	}

	.hero h1 {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: clamp(2em, 5vw, 2.75em);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.tagline {
		margin: 0;
		max-width: 50ch;
		opacity: 0.75;
		line-height: 1.4;
	}

	.search {
		width: 100%;
		max-width: 40ch;
		margin-top: 0.5em;
	}

	.main-view {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		padding: 0.5em 0;
		align-items: flex-start;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		line-height: 1.25;
		width: 22ch;
		position: sticky;
		top: 0.5em;
	}

	.filter-group {
		border: 1px solid var(--outline);
		border-radius: 0.6em;
		background: var(--surface);
		overflow: hidden;
	}

	.filter-group summary {
		display: flex;
		align-items: center;
		gap: 0.4em;
		font-family: var(--alternative-font);
		font-weight: 600;
		cursor: pointer;
		padding: 0.5em 0.7em;
		list-style: none;
		user-select: none;
		transition: background 120ms ease-out;
	}

	.filter-group summary::-webkit-details-marker {
		display: none;
	}

	.filter-group summary:hover {
		background: color-mix(in srgb, var(--on-surface) 5%, transparent);
	}

	.filter-name {
		flex: 1;
	}

	.chevron {
		display: inline-flex;
		transition: transform 150ms ease-out;
	}

	.filter-group[open] .chevron {
		transform: rotate(90deg);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.4em;
		height: 1.4em;
		padding: 0 0.4em;
		border-radius: 999px;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 0.7em;
		font-weight: 700;
	}

	.chip-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3em;
		padding: 0.4em;
	}

	.lang-filter {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		padding: 0.4em;
	}

	.lang-search {
		display: flex;
		align-items: center;
		gap: 0.35em;
		padding: 0.3em 0.5em;
		border: 1px solid var(--outline);
		border-radius: 0.4em;
		color: color-mix(in srgb, var(--on-surface) 60%, transparent);
	}

	.lang-search input {
		appearance: none;
		flex: 1;
		font: inherit;
		font-size: 0.85em;
		color: inherit;
		background: transparent;
		border: none;
		outline: none;
		padding: 0;
		min-width: 0;
	}

	.lang-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3em;
	}

	.lang-empty {
		font-size: 0.8em;
		opacity: 0.6;
		text-align: center;
		padding: 0.4em;
	}

	.results {
		flex: 1;
		min-width: 0;
	}

	.results-heading {
		display: flex;
		align-items: baseline;
		gap: 0.5em;
		font-family: var(--alternative-font);
		font-size: 1em;
		opacity: 0.7;
		margin: 0 0 0.6em;
		line-height: 1;
	}

	.count {
		font-size: 0.8em;
		opacity: 0.7;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(18ch, 100%), 1fr));
		grid-auto-rows: min-content;
		gap: 0.6em;
	}

	.state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		opacity: 0.7;
		min-height: 12em;
		gap: 0.4em;
	}

	.spinner {
		height: 1.5em;
		width: 1.5em;
	}

	@media (max-width: 40em) {
		.main-view {
			flex-direction: column;
		}

		.filters {
			width: 100%;
			position: static;
		}
	}
</style>
