<script lang="ts">
	import { untrack } from 'svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { locales } from '$lib/paraglide/runtime';
	import type { PublishedFuiz } from '$lib/types';
	import { grades, subjects } from '$lib/types';
	import RegularCheckbox from '$lib/ui/regular-checkbox.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import { debounce } from '$lib/util';
	import GhostIcon from '~icons/custom/ghost';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import OnlinePublised from './OnlinePublised.svelte';

	let {
		recentlyPublished
	}: {
		recentlyPublished: PublishedFuiz[];
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

	let languagesSelected = $state(
		locales.map((language) => ({
			name: language,
			display: new Intl.DisplayNames([language], { type: 'language' }).of(language),
			selected: false
		}))
	);

	let subjectsList = $derived(
		subjectsSelected.filter((subject) => subject.selected).map((subject) => subject.name)
	);
	let gradesList = $derived(
		gradesSelected.filter((grade) => grade.selected).map((grade) => grade.name)
	);
	let languagesList = $derived(
		languagesSelected.filter((language) => language.selected).map((language) => language.name)
	);

	let searchCriteria = $derived(
		subjectsList.length + gradesList.length + languagesList.length + searchTerm.length
	);

	let isSearching = $derived(searchCriteria > 0);

	$effect(() => {
		if (searchCriteria > 0) {
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
				<div class="checkbox-list">
					{#each gradesSelected as grade (grade.name)}
						<label class:selected={grade.selected}>
							<input type="checkbox" bind:checked={grade.selected} class="visually-hidden" />
							<RegularCheckbox checked={grade.selected} />
							<span>{grade.name}</span>
						</label>
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
				<div class="checkbox-list">
					{#each subjectsSelected as subject (subject.name)}
						<label class:selected={subject.selected}>
							<input type="checkbox" bind:checked={subject.selected} class="visually-hidden" />
							<RegularCheckbox checked={subject.selected} />
							<span>{subject.name}</span>
						</label>
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
				<div class="checkbox-list">
					{#each languagesSelected as language (language.name)}
						<label class:selected={language.selected}>
							<input type="checkbox" bind:checked={language.selected} class="visually-hidden" />
							<RegularCheckbox checked={language.selected} />
							<span>{language.display}</span>
						</label>
					{/each}
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
		width: 16ch;
		position: sticky;
		top: 0.5em;
	}

	.filter-group {
		border: 1px solid color-mix(in srgb, var(--on-surface) 18%, transparent);
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

	.checkbox-list {
		display: flex;
		flex-direction: column;
		font-size: 0.9em;
		padding: 0.25em 0.4em 0.5em;
	}

	.checkbox-list label {
		display: flex;
		align-items: center;
		gap: 0.45em;
		cursor: pointer;
		padding: 0.3em 0.4em;
		border-radius: 0.4em;
		transition: background 120ms ease-out;
	}

	.checkbox-list label:hover {
		background: color-mix(in srgb, var(--on-surface) 6%, transparent);
	}

	.checkbox-list label.selected {
		color: var(--primary);
		font-weight: 600;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
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
		grid-template-columns: repeat(auto-fill, minmax(16ch, 1fr));
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
</style>
