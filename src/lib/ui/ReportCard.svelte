<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { overallAccuracy } from '$lib/reports';
	import type { InternalReport, ReportId } from '$lib/storage';
	import Card from '$lib/ui/Card.svelte';
	import Groups from '~icons/material-symbols/groups-outline';
	import HelpCenter from '~icons/material-symbols/help-center-outline';
	import Target from '~icons/material-symbols/target';

	let { id, report }: { id: ReportId; report: InternalReport } = $props();

	const dateFormat = new Intl.DateTimeFormat(getLocale(), {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
</script>

<Card href={resolve(localizeHref(`/reports/${id}`))} gap="0.15em">
	<span class="title">{report.title}</span>
	<span class="when">{m.played_on({ date: dateFormat.format(report.playedAt) })}</span>
	<span class="stats">
		<span class="stat" title={m.number_of_players()}>
			<Groups height="1em" width="1em" />
			{report.playerCount}
		</span>
		<span class="stat" title={m.slides_count({ count: report.questions.length })}>
			<HelpCenter height="1em" width="1em" />
			{report.questions.length}
		</span>
		<span class="stat" title={m.accuracy()}>
			<Target height="1em" width="1em" />
			{Math.round(overallAccuracy(report) * 100)}%
		</span>
	</span>
</Card>

<style>
	.title {
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.when {
		font-size: 0.75em;
		opacity: 0.65;
	}

	.stats {
		display: flex;
		gap: 0.8em;
		margin-top: 0.4em;
		font-size: 0.8em;
		opacity: 0.8;
		font-variant-numeric: tabular-nums;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.25em;
	}
</style>
