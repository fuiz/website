<script>
	import { untrack } from 'svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { locales } from '$lib/paraglide/runtime';
	import { grades, subjects } from '$lib/types';
	import RegularCheckbox from '$lib/ui/regular-checkbox.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import { debounce } from '$lib/util';
	import GhostIcon from '~icons/custom/ghost';
	import OnlinePublised from './OnlinePublised.svelte';

	/** @type {{recentlyPublished: import('$lib/types').PublishedFuiz[];}} */
	let { recentlyPublished } = $props();

	let searchTerm = $state('');

	/** @type {Promise<import('$lib/types').PublishedFuiz[] | undefined> | undefined} */
	let results = $state(undefined);

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

	$effect(() => {
		if (searchCriteria > 0) {
			untrack(search);
		} else {
			results = undefined;
		}
	});
</script>

<Textfield
	id="search"
	required={false}
	disabled={false}
	bind:value={searchTerm}
	placeholder="Search"
/>

<div class="main-view">
	<div class="filters">
		<details>
			<summary>Grades</summary>
			<div class="checkbox-list">
				{#each gradesSelected as grade (grade.name)}
					<label>
						<input type="checkbox" bind:checked={grade.selected} style:display="none" />
						<RegularCheckbox checked={grade.selected} />
						{grade.name}
					</label>
				{/each}
			</div>
		</details>
		<details>
			<summary>Subjects</summary>
			<div class="checkbox-list">
				{#each subjectsSelected as subject (subject.name)}
					<label>
						<input type="checkbox" bind:checked={subject.selected} style:display="none" />
						<RegularCheckbox checked={subject.selected} />
						{subject.name}
					</label>
				{/each}
			</div>
		</details>
		<details>
			<summary>Language</summary>
			<div class="checkbox-list">
				{#each languagesSelected as language (language.name)}
					<label>
						<input type="checkbox" bind:checked={language.selected} style:display="none" />
						<RegularCheckbox checked={language.selected} />
						{language.display}
					</label>
				{/each}
			</div>
		</details>
	</div>
	{#await results}
		<div
			style:display="flex"
			style:justify-content="center"
			style:align-items="center"
			style:flex="1"
		>
			<div style:height="1em" style:width="1em" style:margin="1em">
				<LoadingCircle />
			</div>
		</div>
	{:then results}
		{#if results && (searchTerm.length || subjectsList.length || gradesList.length || languagesList.length)}
			<div class="section">
				<div class="grid">
					{#each results as fuiz (fuiz.storage_id)}
						<OnlinePublised data={fuiz} />
					{:else}
						<div
							style:display="flex"
							style:flex-direction="column"
							style:opacity="0.7"
							style:align-items="center"
							style:justify-content="center"
						>
							<GhostIcon height="min(20vh, 60vw)" width="min(20vh, 60vw)" title={m.nothing()} />
							{m.nothing()}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="section">
				<div class="grid">
					{#each recentlyPublished as fuiz (fuiz.storage_id)}
						<OnlinePublised data={fuiz} />
					{:else}
						<div
							style:display="flex"
							style:flex-direction="column"
							style:opacity="0.7"
							style:align-items="center"
							style:justify-content="center"
						>
							<GhostIcon height="min(20vh, 60vw)" width="min(20vh, 60vw)" title={m.nothing()} />
							{m.nothing()}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/await}
</div>

<style>
	.main-view {
		display: flex;
		flex-wrap: wrap;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
		padding: 0.5em;
		line-height: 1.25;
		min-width: 15ch;
	}

	.checkbox-list {
		display: flex;
		flex-direction: column;
		font-size: 0.8em;
		gap: 0.2em;

		& label {
			display: flex;
			gap: 0.2em;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16ch, 1fr));
		grid-auto-rows: min-content;
		grid-gap: 0.4em;
		padding: 0.4em;
		height: 100%;
	}

	.section {
		margin-bottom: 0.8em;
		flex: 1;
		height: auto;
	}
</style>
