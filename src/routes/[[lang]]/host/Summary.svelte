<script lang="ts">
	import { resolve } from '$app/paths';
	import { downloadBlob, type FuizOrigin, playBackendReadyIdConfig } from '$lib/clientOnly';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { reportToCsv } from '$lib/reports';
	import { addReport, loadDatabase, type ReportBody, type ReportId } from '$lib/storage';
	import { type FuizConfig, type FuizOptions, getTitle } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Bookmark from '~icons/material-symbols/bookmark-outline';
	import Check from '~icons/material-symbols/check-circle-outline';
	import Download from '~icons/material-symbols/download';
	import Repeat from '~icons/material-symbols/repeat';

	let {
		stats,
		player_count,
		config,
		options,
		results,
		team_mapping = {},
		code,
		origin
	}: {
		stats: [number, number][];
		player_count: number;
		config: FuizConfig;
		options: FuizOptions;
		results: { [k: string]: number[] };
		team_mapping?: { [k: string]: string[] };
		code?: string;
		origin?: FuizOrigin;
	} = $props();

	let hasResults = $derived(Object.keys(results).length > 0);

	// Captured once so the saved report records when the game actually ended, not when the
	// host got around to pressing save.
	const playedAt = Date.now();

	let report: ReportBody = $derived({
		title: config.title,
		playedAt,
		gameCode: code,
		fuizUniqueId: origin?.uniqueId,
		fuizVersionId: origin?.versionId,
		playerCount: player_count,
		questions: config.slides.map((slide, index) => {
			const [correct, wrong] = stats.at(index) ?? [0, 0];
			return { title: getTitle(slide), correct, wrong };
		}),
		results: Object.entries(results),
		teams: Object.keys(team_mapping).length > 0 ? Object.entries(team_mapping) : undefined
	});

	let saveState = $state<'unsaved' | 'saving' | 'saved'>('unsaved');
	let savedId = $state<ReportId>();
	let saveError = $state('');

	async function save() {
		saveState = 'saving';
		saveError = '';
		try {
			const database = await loadDatabase();
			savedId = await addReport(report, database);
			saveState = 'saved';
		} catch (error) {
			console.error('Failed to save report', error);
			saveError = m.save_report_failed();
			saveState = 'unsaved';
		}
	}
</script>

<TypicalPage>
	<div id="summary">
		{#if hasResults}
			{#if saveState === 'saved' && savedId !== undefined}
				<div class="banner saved">
					<Check height="1.2em" width="1.2em" />
					<span class="banner-text">{m.report_saved()}</span>
					<a class="banner-link" href={resolve(localizeHref(`/reports/${savedId}`))}>
						{m.view_report()}
					</a>
				</div>
			{:else}
				<div class="banner unsaved">
					<div class="banner-copy">
						<div class="banner-title">{m.report_unsaved_title()}</div>
						<div class="banner-detail">{saveError || m.report_unsaved_detail()}</div>
					</div>
					<div class="banner-action">
						<FancyButton onclick={save} disabled={saveState === 'saving'}>
							<div class="action">
								<Bookmark height="1.1em" width="1.1em" />
								{m.save_report()}
							</div>
						</FancyButton>
					</div>
				</div>
			{/if}
		{/if}
		<div id="actions">
			<div class="action-container">
				<FancyButton onclick={() => playBackendReadyIdConfig(config, options, origin)}>
					<div class="action">
						<Repeat height="1.1em" width="1.1em" />
						{m.play_again()}
					</div>
				</FancyButton>
			</div>
			{#if hasResults}
				<div class="action-container">
					<FancyButton
						onclick={() =>
							downloadBlob([reportToCsv(report)], `${config.title} results.csv`, {
								type: 'text/csv;charset=utf-8'
							})}
					>
						<div class="action">
							<Download height="1.1em" width="1.1em" />
							{m.download_results()}
						</div>
					</FancyButton>
				</div>
			{/if}
		</div>
		<div id="lines">
			{#each config.slides as slide, index (slide.id)}
				{@const [correct, wrong] = stats.at(index) || [0, 0]}
				{@const unanswered = Math.max(0, player_count - correct - wrong)}
				{@const title = getTitle(slide)}
				<div class="line">
					<div class="label">
						<span class="num">{m.question_text()} {index + 1}</span>
						<span
							class="score"
							title="{correct} {m.correct()} · {wrong} {m.wrong()} · {unanswered} {m.unanswered()}"
						>
							{correct}/{player_count}
						</span>
					</div>
					<div class="card">{title}</div>
				</div>
			{/each}
		</div>
	</div>
</TypicalPage>

<style>
	#summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		gap: 0.8em;
		width: 100%;
		max-width: min(50ch, 90vw);
		padding: 0.4em;
		box-sizing: border-box;
	}

	.banner {
		display: flex;
		align-items: center;
		gap: 0.6em;
		border-radius: 0.7em;
		padding: 0.6em 0.75em;
	}

	.banner.unsaved {
		background: var(--primary-container);
		color: var(--on-primary-container);
		flex-wrap: wrap;
	}

	.banner.saved {
		border: 1px solid var(--outline);
		font-size: 0.85em;
	}

	.banner-copy {
		flex: 1;
		min-width: 12ch;
	}

	.banner-title {
		font-weight: 700;
		font-size: 0.9em;
	}

	.banner-detail {
		font-size: 0.75em;
		opacity: 0.85;
	}

	.banner-action {
		flex: 0 0 auto;
		font-size: 0.85em;
	}

	.banner-text {
		flex: 1;
		font-weight: 600;
	}

	.banner-link {
		color: inherit;
		font-weight: 700;
	}

	#actions {
		display: flex;
		gap: 0.3em;
		flex-wrap: wrap;
	}

	#actions .action-container {
		flex: 1;
	}

	.action {
		padding: 0 0.3em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
	}

	#lines {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
	}

	.line {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	.label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5em;
		padding: 0 0.3em;
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
	}

	.num {
		font-family: var(--alternative-font);
		font-weight: 800;
	}

	.score {
		padding: 0.15em 0.5em;
		border-radius: 999px;
		background: var(--on-surface);
		color: var(--surface);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		text-transform: none;
		letter-spacing: 0;
	}

	.card {
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		background: var(--surface);
		padding: 0.5em 0.7em;
		font-weight: 600;
		overflow-wrap: anywhere;
	}
</style>
