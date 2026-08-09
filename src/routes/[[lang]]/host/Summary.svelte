<script lang="ts">
	import { resolve } from '$app/paths';
	import { downloadBlob, type FuizOrigin, playBackendReadyIdConfig } from '$lib/clientOnly';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { hasResponses, pivotResponses, reportToCsv, responsesToCsv } from '$lib/reports';
	import { addReport, loadDatabase, type ReportBody, type ReportId } from '$lib/storage';
	import { type FuizConfig, type FuizOptions, getPointsAwarded, getTitle } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';
	import Bookmark from '~icons/material-symbols/bookmark-outline';
	import Check from '~icons/material-symbols/check-circle-outline';
	import Download from '~icons/material-symbols/download';
	import Repeat from '~icons/material-symbols/repeat';
	import Warning from '~icons/material-symbols/warning-outline';

	let {
		stats,
		player_count,
		config,
		options,
		results,
		team_mapping = {},
		code,
		capturedResponses = {},
		origin
	}: {
		stats: [number, number][];
		player_count: number;
		config: FuizConfig;
		options: FuizOptions;
		results: { [k: string]: number[] };
		team_mapping?: { [k: string]: string[] };
		code?: string;
		/** What each slide's responders said, gathered as the game ran. */
		capturedResponses?: Record<number, { name: string; answer: string }[]>;
		origin?: FuizOrigin;
	} = $props();

	let hasResults = $derived(Object.keys(results).length > 0);

	// Captured once so the saved report records when the game actually ended, not when the
	// host got around to pressing save.
	const playedAt = Date.now();

	// In team mode the scoreboard is keyed by team, but answers are always keyed
	// by the individual who typed them, so the roster has to come from the team
	// rosters rather than from `results` or every team would show up as a blank row.
	let roster = $derived(
		Object.keys(team_mapping).length > 0 ? Object.values(team_mapping).flat() : Object.keys(results)
	);

	let responses = $derived(pivotResponses(config.slides.length, capturedResponses, roster));

	let report: ReportBody = $derived({
		title: config.title,
		playedAt,
		gameCode: code,
		fuizUniqueId: origin?.uniqueId,
		fuizVersionId: origin?.versionId,
		playerCount: player_count,
		questions: config.slides.map((slide, index) => {
			const [correct, wrong] = stats.at(index) ?? [0, 0];
			return { title: getTitle(slide), correct, wrong, pointsAwarded: getPointsAwarded(slide) };
		}),
		results: Object.entries(results),
		teams: Object.keys(team_mapping).length > 0 ? Object.entries(team_mapping) : undefined,
		responses: responses.length > 0 ? responses : undefined
	});

	let saveState = $state<'unsaved' | 'saving' | 'saved'>('unsaved');
	let savedId = $state<ReportId>();
	let saveError = $state('');

	let saved = $derived(saveState === 'saved' && savedId !== undefined);

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
		<!--
			The actions come first in the source so that on a phone, where the panes
			collapse into one column, the host meets "save this" before scrolling a
			long question list. On a wide screen they move to the right-hand pane.
		-->
		<aside id="actions">
			{#if hasResults}
				{#if saved}
					<div class="notice">
						<Check class="ok-icon" height="1.1em" width="1.1em" />
						<div>
							<div class="title">{m.report_saved()}</div>
							<a class="link" href={resolve(localizeHref(`/reports/${savedId}`))}>
								{m.view_report()}
							</a>
						</div>
					</div>
				{:else}
					<div class="notice unsaved">
						<Warning class="warn-icon" height="1.1em" width="1.1em" />
						<div>
							<div class="title">{m.report_unsaved_title()}</div>
							<div class="detail">{saveError || m.report_unsaved_detail()}</div>
						</div>
					</div>
					<FancyButton onclick={save} disabled={saveState === 'saving'}>
						<div class="action">
							<Bookmark height="1.1em" width="1.1em" />
							{m.save_report()}
						</div>
					</FancyButton>
				{/if}
			{/if}

			<FancyButton
				palette={hasResults && !saved ? 'secondary' : undefined}
				onclick={() => playBackendReadyIdConfig(config, options, origin)}
			>
				<div class="action">
					<Repeat height="1.1em" width="1.1em" />
					{m.play_again()}
				</div>
			</FancyButton>

			{#if hasResults}
				<SectionLabel --section-label-margin="0.5em 0 0" --section-label-padding="0 0.2em">
					{m.export_title()}
				</SectionLabel>
				<FancyButton
					palette="secondary"
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
				{#if hasResponses(report)}
					<FancyButton
						palette="secondary"
						onclick={() =>
							downloadBlob([responsesToCsv(report)], `${config.title} responses.csv`, {
								type: 'text/csv;charset=utf-8'
							})}
					>
						<div class="action">
							<Download height="1.1em" width="1.1em" />
							{m.download_responses()}
						</div>
					</FancyButton>
				{/if}
			{/if}
		</aside>

		<div id="lines">
			{#each config.slides as slide, index (slide.id)}
				{@const [correct, wrong] = stats.at(index) || [0, 0]}
				{@const unanswered = Math.max(0, player_count - correct - wrong)}
				{@const title = getTitle(slide)}
				{@const scored = getPointsAwarded(slide) > 0}
				{@const responded = capturedResponses[index]?.length}
				<div class="line">
					<div class="label">
						<SectionLabel as="span">{m.question_text()} {index + 1}</SectionLabel>
						{#if scored}
							<span
								class="score"
								title="{correct} {m.correct()} · {wrong} {m.wrong()} · {unanswered} {m.unanswered()}"
							>
								{correct}/{player_count}
							</span>
						{:else if responded !== undefined}
							<!-- Nothing was right or wrong here, so the tally counts who spoke up. -->
							<span class="score neutral" title={m.responses()}>
								{responded}/{player_count}
							</span>
						{/if}
					</div>
					<div class="card">{title}</div>
				</div>
			{/each}
		</div>
	</div>
</TypicalPage>

<style>
	/*
	 * One column on a phone, two panes once there is room: the question list on
	 * the left, the actions ranged down the right. The second pane only appears
	 * above the breakpoint, so the phone layout stays a single full-width column.
	 */
	#summary {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		margin: 0 auto;
		gap: 0.8em;
		width: 100%;
		max-width: min(50ch, 90vw);
		padding: 0.4em;
		box-sizing: border-box;
	}

	@media (width >= 52em) {
		#summary {
			grid-template-columns: minmax(0, 1fr) 21ch;
			align-items: start;
			max-width: min(78ch, 95vw);
			gap: 1.2em;
		}

		#lines {
			grid-column: 1;
			grid-row: 1;
		}

		#actions {
			grid-column: 2;
			grid-row: 1;
			/* The question list is the long thing here, so the actions follow it down. */
			position: sticky;
			top: 0.5em;
		}
	}

	#actions {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		font-size: 0.9em;
	}

	/*
	 * Deliberately not filled with `--primary-container`: the Save button sits
	 * directly beneath it in its own red, and two stacked reds read as two
	 * competing alarms rather than one message and its answer. The icon carries
	 * the attention, the button carries the urgency.
	 */
	.notice {
		display: flex;
		align-items: flex-start;
		gap: 0.45em;
		border-radius: 0.7em;
		padding: 0.55em 0.7em;
		background: var(--surface-variant);
	}

	.notice :global(.warn-icon),
	.notice :global(.ok-icon) {
		flex: 0 0 auto;
		margin-top: 0.1em;
	}

	.notice :global(.warn-icon) {
		color: var(--primary);
	}

	.link {
		display: inline-block;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 0.35em;
		font-weight: 700;
		font-size: 0.9em;
	}

	.detail {
		font-size: 0.75em;
		opacity: 0.85;
		line-height: 1.45;
	}

	.link {
		font-size: 0.8em;
		font-weight: 700;
		color: inherit;
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

	/* Pure layout: the eyebrow's own typography comes from .section-label. */
	.label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5em;
		padding: 0 0.3em;
	}

	.score {
		font-size: 0.75em;
		padding: 0.15em 0.5em;
		border-radius: 999px;
		background: var(--on-surface);
		color: var(--surface);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	/* A response count isn't a score, so it doesn't get the score's solid fill. */
	.score.neutral {
		background: none;
		color: inherit;
		border: 1px solid var(--outline);
		font-weight: 600;
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
