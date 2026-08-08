<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { downloadFuiz, shareAndCopyURL } from '$lib/clientOnly';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { overallAccuracy } from '$lib/reports';
	import {
		type CreationId,
		deleteCreation,
		getCreation,
		getLocalReports,
		type InternalReport,
		loadDatabase,
		type ReportId
	} from '$lib/storage';
	import type { IdlessFullFuizConfig } from '$lib/types';
	import { getMedia, type Media } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import OutcomeBar from '$lib/ui/OutcomeBar.svelte';
	import type { OverflowItem } from '$lib/ui/OverflowMenu.svelte';
	import OverflowMenu from '$lib/ui/OverflowMenu.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import Download from '~icons/material-symbols/download';
	import Edit from '~icons/material-symbols/edit-outline';
	import Groups from '~icons/material-symbols/groups-outline';
	import Publish from '~icons/material-symbols/publish';
	import Share from '~icons/material-symbols/share';
	import Slideshow from '~icons/material-symbols/slideshow-outline-sharp';

	let { data } = $props();

	let id = $derived(parseInt(page.params.id ?? '', 10));

	const dateFormat = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' });
	const timeFormat = new Intl.DateTimeFormat(getLocale(), {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	let deleteDialog = $state<ConfirmationDialog>();
	let pageTitle = $state<string>(m.create_title());

	async function load(id: CreationId) {
		const database = await loadDatabase();
		const fuiz = await getCreation(id, database);
		if (!fuiz) return undefined;

		const reports = (await getLocalReports(database)).filter(
			([, report]) => report.fuizUniqueId === fuiz.uniqueId
		);

		pageTitle = fuiz.config.title;
		return {
			fuiz,
			media: fuiz.config.slides.reduce<Media | undefined>((p, c) => p || getMedia(c), undefined),
			reports
		};
	}

	/** Aggregate correct/wrong across every question, so one bar summarises a whole game. */
	function totals(report: InternalReport) {
		const correct = report.questions.reduce((sum, q) => sum + q.correct, 0);
		const wrong = report.questions.reduce((sum, q) => sum + q.wrong, 0);
		const answerable = report.questions.length * report.playerCount;
		return { correct, wrong, unanswered: Math.max(0, answerable - correct - wrong) };
	}

	async function remove() {
		await deleteCreation(id, await loadDatabase());
		await goto(resolve(localizeHref('/create')));
	}

	let copiedPopover = $state<HTMLDivElement>();
	let menuWrap = $state<HTMLDivElement>();
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	/** The menu closes on click, so copying needs its own confirmation. */
	async function share(config: IdlessFullFuizConfig) {
		await shareAndCopyURL(config);
		try {
			copiedPopover?.showPopover({ source: menuWrap });
		} catch {
			/* already shown */
		}
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => {
			try {
				copiedPopover?.hidePopover();
			} catch {
				/* already hidden */
			}
		}, 1500);
	}

	function menuItems(config: IdlessFullFuizConfig): OverflowItem[] {
		return [
			...(data.showShare ? [{ label: m.share(), icon: Share, onclick: () => share(config) }] : []),
			...(data.showPublish
				? [
						{
							label: m.publish(),
							icon: Publish,
							onclick: () => goto(resolve(localizeHref(`/publish?id=${id}`)))
						}
					]
				: []),
			{ label: m.download(), icon: Download, onclick: () => downloadFuiz(config) },
			{
				label: m.delete_confirm(),
				icon: DeleteOutline,
				danger: true,
				onclick: () => deleteDialog?.open()
			}
		];
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta property="og:title" content={pageTitle} />
</svelte:head>

{#if Number.isNaN(id)}
	<ErrorPage errorMessage={m.missing_fuiz()} />
{:else}
	{#await load(id)}
		<Loading />
	{:then loaded}
		{#if !loaded}
			<ErrorPage errorMessage={m.missing_fuiz()} />
		{:else}
			{@const { fuiz, media, reports } = loaded}
			<TypicalPage>
				<div class="wrapper">
					<div class="split">
						<aside class="panel">
							<div class="panel-thumb">
								<MediaContainer {media} fit="cover" />
							</div>
							<div class="panel-head">
								<h1 class="panel-title">{fuiz.config.title}</h1>
								<div class="menu-wrap" bind:this={menuWrap}>
									<OverflowMenu
										id="quiz-options"
										label={m.options()}
										items={menuItems(fuiz.config)}
									/>
									<div bind:this={copiedPopover} popover="manual" class="fuiz-popover">
										{m.copied()}
									</div>
								</div>
							</div>
							<div class="panel-meta">
								{m.slides_count({ count: fuiz.config.slides.length })}
								· {m.edited_on({ date: dateFormat.format(fuiz.lastEdited) })}
							</div>

							<div class="panel-actions">
								<FancyButton onclick={() => goto(resolve(localizeHref(`/quiz/${id}/edit`)))}>
									<div class="action"><Edit height="1.1em" width="1.1em" /> {m.edit()}</div>
								</FancyButton>
								<FancyButton
									palette="secondary"
									onclick={() => goto(resolve(localizeHref(`/quiz/${id}/host`)))}
								>
									<div class="action"><Slideshow height="1.1em" width="1.1em" /> {m.host()}</div>
								</FancyButton>
							</div>
						</aside>

						<div class="history">
							<SectionLabel --section-label-margin="0 0 0.5em">
								{reports.length
									? m.reports_count({ count: reports.length })
									: m.reports()}
							</SectionLabel>
							{#if reports.length}
								<ol class="runs">
									{#each reports as [reportId, report] (reportId)}
										{@const t = totals(report)}
										<li>
											<a class="run" href={resolve(localizeHref(`/reports/${reportId}`))}>
												<span class="run-when">{timeFormat.format(report.playedAt)}</span>
												<span class="run-players">
													<Groups height="0.9em" width="0.9em" />
													{report.playerCount}
												</span>
												<span class="run-bar">
													<OutcomeBar
														correct={t.correct}
														wrong={t.wrong}
														unanswered={t.unanswered}
													/>
												</span>
												<span class="run-acc">{Math.round(overallAccuracy(report) * 100)}%</span>
											</a>
										</li>
									{/each}
								</ol>
							{:else}
								<div class="empty">
									<div class="empty-title">{m.not_hosted_yet()}</div>
									<div class="empty-detail">{m.not_hosted_yet_detail()}</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</TypicalPage>

			<ConfirmationDialog
				bind:this={deleteDialog}
				title={m.delete_forever()}
				message=""
				confirmText={m.delete_confirm()}
				onConfirm={remove}
			/>
		{/if}
	{/await}
{/if}

<style>
	.wrapper {
		max-width: 78ch;
		margin: 1em auto;
		padding: 0 0.6em;
	}

	.split {
		display: grid;
		grid-template-columns: 15em minmax(0, 1fr);
		gap: 1.2em;
	}

	@media (max-width: 700px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.9em;
		}
	}

	.panel {
		border-right: 1px solid var(--outline);
		padding-right: 1.2em;
	}

	@media (max-width: 700px) {
		.panel {
			border-right: none;
			border-bottom: 1px solid var(--outline);
			padding-right: 0;
			padding-bottom: 1em;
		}
	}

	.panel-thumb {
		/* MediaContainer is `position: absolute; inset: 0`, so it needs a positioned
		   ancestor or it escapes and fills the viewport. */
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: 0.5em;
		overflow: hidden;
		background: color-mix(in srgb, var(--on-surface) 10%, var(--surface));
		margin-bottom: 0.6em;
	}

	.panel-head {
		display: flex;
		align-items: flex-start;
		gap: 0.3em;
	}

	.menu-wrap {
		flex: 0 0 auto;
	}

	.panel-title {
		flex: 1;
		min-width: 0;
		font-family: var(--alternative-font);
		font-size: 1.15em;
		line-height: 1.15;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.panel-meta {
		font-size: 0.72em;
		opacity: 0.6;
		margin-bottom: 0.7em;
	}

	.panel-actions {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
		font-size: 0.9em;
	}

	.action {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		padding: 0 0.3em;
	}


	.runs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}

	.run {
		display: flex;
		align-items: center;
		gap: 0.7em;
		background: var(--surface);
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		padding: 0.5em 0.6em;
		font-size: 0.8em;
		color: inherit;
		text-decoration: none;
	}

	.run:hover {
		background: var(--surface-variant);
	}

	.run-when {
		flex: 1;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.run-players {
		display: flex;
		align-items: center;
		gap: 0.25em;
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	.run-bar {
		width: 6em;
		flex: 0 0 auto;
	}

	.run-acc {
		/* min- not a fixed width: "100%" needs ~4.4ch, so 3.5ch let the text spill
		   out of the box and sit on the row's padding. */
		min-width: 4.5ch;
		text-align: end;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.empty {
		border: 1px dashed var(--outline);
		border-radius: 0.6em;
		padding: 1.5em 1em;
		text-align: center;
	}

	.empty-title {
		font-weight: 700;
		font-size: 0.9em;
	}

	.empty-detail {
		font-size: 0.75em;
		opacity: 0.7;
		margin-top: 0.2em;
	}

	@media (max-width: 480px) {
		.run-bar {
			display: none;
		}
	}
</style>
