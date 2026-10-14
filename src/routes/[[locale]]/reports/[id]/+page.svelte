<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { downloadBlob } from '$lib/clientOnly';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { hasResponses, reportToCsv, responsesToCsv } from '$lib/reports';
	import {
		deleteReport,
		findCreationByUniqueId,
		getReport,
		loadDatabase,
		type ReportId
	} from '$lib/storage';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import ReportBody from '$lib/ui/ReportBody.svelte';
	import Delete from '~icons/material-symbols/delete-outline';
	import Download from '~icons/material-symbols/download';
	import Warning from '~icons/material-symbols/warning-outline';
	import ReportTitle from './ReportTitle.svelte';

	let id = $derived(parseInt(page.params.id ?? '', 10));

	const dateFormat = new Intl.DateTimeFormat(getLocale(), {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	let deleteDialog = $state<ConfirmationDialog>();

	async function load(id: ReportId) {
		const database = await loadDatabase();
		const report = await getReport(id, database);
		if (!report) return undefined;
		const origin = report.fuizUniqueId
			? await findCreationByUniqueId(report.fuizUniqueId, database)
			: undefined;
		pageTitle = report.title;
		return { report, origin };
	}

	// Tracked separately from the {#await} so <svelte:head> can stay at the top level.
	let pageTitle = $state<string>(m.reports());

	async function remove() {
		await deleteReport(id, await loadDatabase());
		await goto(resolve(localizeHref('/reports')));
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta property="og:title" content={pageTitle} />
</svelte:head>

{#if Number.isNaN(id)}
	<ErrorPage errorMessage={m.no_reports_title()} />
{:else}
	{#await load(id)}
		<Loading />
	{:then loaded}
		{#if !loaded}
			<ErrorPage errorMessage={m.no_reports_title()} />
		{:else}
			{@const { report, origin } = loaded}
			{@const drifted =
				origin !== undefined &&
				report.fuizVersionId !== undefined &&
				origin.versionId !== report.fuizVersionId}

			<TypicalPage>
				<div class="wrapper">
					<ReportTitle {id} {report} />
					<div class="when">
						{m.played_on({ date: dateFormat.format(report.playedAt) })}
						{#if report.gameCode}
							· {m.game_code()}
							{report.gameCode}
						{/if}
					</div>

					{#if drifted}
						<div class="notice">
							<Warning height="1.1em" width="1.1em" />
							<span>{m.report_quiz_changed()}</span>
						</div>
					{/if}

					<div class="actions">
						<div class="action-container">
							<FancyButton
								onclick={() =>
									downloadBlob([reportToCsv(report)], `${report.title} results.csv`, {
										type: 'text/csv;charset=utf-8'
									})}
							>
								<div class="action">
									<Download height="1.1em" width="1.1em" />
									{m.download_results()}
								</div>
							</FancyButton>
						</div>
						{#if hasResponses(report)}
							<div class="action-container">
								<FancyButton
									onclick={() =>
										downloadBlob([responsesToCsv(report)], `${report.title} responses.csv`, {
											type: 'text/csv;charset=utf-8'
										})}
								>
									<div class="action">
										<Download height="1.1em" width="1.1em" />
										{m.download_responses()}
									</div>
								</FancyButton>
							</div>
						{/if}
						{#if origin}
							<div class="action-container">
								<FancyButton
									palette="secondary"
									onclick={() => goto(resolve(localizeHref(`/quiz/${origin.id}`)))}
								>
									<div class="action">{m.open_quiz()}</div>
								</FancyButton>
							</div>
						{/if}
						<div class="action-container">
							<FancyButton palette="tertiary" onclick={() => deleteDialog?.open()}>
								<div class="action">
									<Delete height="1.1em" width="1.1em" />
									{m.delete_report()}
								</div>
							</FancyButton>
						</div>
					</div>

					<ReportBody {report} />
				</div>
			</TypicalPage>

			<ConfirmationDialog
				bind:this={deleteDialog}
				title={m.delete_report()}
				message={m.delete_report_message()}
				confirmText={m.delete_confirm()}
				onConfirm={remove}
			/>
		{/if}
	{/await}
{/if}

<style>
	.wrapper {
		max-width: 70ch;
		margin: 1em auto;
		padding: 0 0.4em;
	}

	.when {
		font-size: 0.75em;
		opacity: 0.65;
		margin-bottom: 0.8em;
	}

	.notice {
		display: flex;
		align-items: center;
		gap: 0.4em;
		background: var(--primary-container);
		color: var(--on-primary-container);
		border-radius: 0.7em;
		padding: 0.5em 0.7em;
		font-size: 0.8em;
		margin-bottom: 0.8em;
	}





	.actions {
		display: flex;
		gap: 0.3em;
		flex-wrap: wrap;
		font-size: 0.85em;
	}

	.actions .action-container {
		flex: 1;
	}

	.action {
		padding: 0 0.3em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
	}





















</style>
