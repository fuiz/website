<script lang="ts">
	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { type InternalReport, loadDatabase, type ReportId, updateReport } from '$lib/storage';
	import Textbox from '$lib/ui/Textbox.svelte';
	import { debounce } from '$lib/util';
	import Edit from '~icons/material-symbols/edit-outline';

	let { id, report }: { id: ReportId; report: InternalReport } = $props();

	// The stored record is tracked locally so each save builds on the version it produced;
	// the prop is only ever the starting point, so the initial read is deliberate.
	let current = $state(untrack(() => report));
	let title = $state(untrack(() => report.title));

	const persist = debounce(() => {
		if (title === current.title) return;
		loadDatabase()
			.then((database) => updateReport(id, { ...current, title }, database))
			.then((updated) => {
				current = updated;
			})
			.catch((error) => console.error('Failed to rename report', error));
	}, 600);

	$effect(() => {
		// Read `title` so the effect re-runs on every keystroke.
		void title;
		persist();
	});
</script>

<div class="title-row">
	<Edit height="1em" width="1em" />
	<Textbox
		bind:value={title}
		placeholder={m.report_name()}
		textAlign="start"
		padding="0.1em 0.2em"
		maxLength={100}
	/>
</div>

<style>
	.title-row {
		display: flex;
		align-items: center;
		gap: 0.3em;
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1.3em;
		opacity: 0.9;
	}
</style>
