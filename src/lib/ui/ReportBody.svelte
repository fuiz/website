<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import {
		averageScore,
		hardestQuestion,
		overallAccuracy,
		playerRows,
		questionMaxima,
		questionRows
	} from '$lib/reports';
	import type { ReportBody } from '$lib/storage';
	import OutcomeBar from '$lib/ui/OutcomeBar.svelte';
	import ResultsGrid from '$lib/ui/ResultsGrid.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';
	import { toSorted } from '$lib/util';
	import Groups from '~icons/material-symbols/groups-outline';
	import Scoreboard from '~icons/material-symbols/scoreboard-outline';
	import Target from '~icons/material-symbols/target';
	import TrendingDown from '~icons/material-symbols/trending-down';

	let { report }: { report: ReportBody } = $props();

	let rows = $derived(playerRows(report));
	let maxima = $derived(questionMaxima(report));
	let questions = $derived(questionRows(report));
	let hardest = $derived(hardestQuestion(report));
	let titles = $derived(report.questions.map((q) => q.title));
</script>

<div class="metrics">
	<div class="metric">
		<span class="metric-label"><Groups height="1em" width="1em" />{m.number_of_players()}</span>
		<span class="metric-value">{report.playerCount}</span>
	</div>
	<div class="metric">
		<span class="metric-label"><Target height="1em" width="1em" />{m.accuracy()}</span>
		<span class="metric-value">{Math.round(overallAccuracy(report) * 100)}%</span>
	</div>
	<div class="metric">
		<span class="metric-label"><Scoreboard height="1em" width="1em" />{m.average_score()}</span>
		<span class="metric-value">{averageScore(report).toLocaleString(getLocale())}</span>
	</div>
	<div class="metric">
		<span class="metric-label"><TrendingDown height="1em" width="1em" />{m.hardest_question()}</span>
		<span class="metric-value">
			{hardest ? `${m.question_text()} ${hardest.index + 1}` : '—'}
		</span>
	</div>
</div>

<SectionLabel as="h3" --section-label-margin="1.2em 0 0.4em">{m.scores()}</SectionLabel>
<ResultsGrid {rows} {maxima} questionTitles={titles} />

<SectionLabel as="h3" --section-label-margin="1.2em 0 0.4em">
	{m.questions_title()}
	{#snippet trailing()}
		<span class="hint">{m.sorted_by_hardest()}</span>
	{/snippet}
</SectionLabel>
<div class="questions">
	{#each toSorted(questions, (a, b) => a.accuracy - b.accuracy) as question (question.index)}
		<div class="question">
			<span class="q-num">{question.index + 1}</span>
			<span class="q-title">{question.title}</span>
			<span class="q-bar">
				<OutcomeBar
					correct={question.correct}
					wrong={question.wrong}
					unanswered={question.unanswered}
				/>
			</span>
			<span class="q-accuracy">{Math.round(question.accuracy * 100)}%</span>
		</div>
	{/each}
</div>
<div class="legend">
	<span class="key"><i class="swatch correct"></i>{m.correct()}</span>
	<span class="key"><i class="swatch wrong"></i>{m.wrong()}</span>
	<span class="key"><i class="swatch none"></i>{m.unanswered()}</span>
</div>

<style>
	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9ch), 1fr));
		gap: 0.4em;
		/* Top margin so the component does not sit flush against whatever precedes it,
		   the report page puts its action buttons directly above. Adjacent-sibling margins
		   collapse, so a caller adding its own spacing will not double this. */
		margin-top: 0.8em;
		margin-bottom: 0.8em;
	}

	.metric {
		display: flex;
		flex-direction: column;
		background: var(--surface-variant);
		color: var(--on-surface-variant);
		border-radius: 0.7em;
		padding: 0.5em 0.7em;
	}

	.metric-label {
		display: flex;
		align-items: center;
		gap: 0.3em;
		font-size: 0.7em;
		opacity: 0.8;
	}

	.metric-value {
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1.2em;
		font-variant-numeric: tabular-nums;
	}

	.hint {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
	}

	.questions {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.question {
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-size: 0.85em;
	}

	.q-num {
		min-width: 1.5em;
		opacity: 0.5;
		font-variant-numeric: tabular-nums;
	}

	.q-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.q-bar {
		width: min(35%, 10em);
		flex: 0 0 auto;
	}

	.q-accuracy {
		/* Wide enough for "100%"; see .run-acc on the quiz overview. */
		min-width: 4.5ch;
		text-align: end;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}

	.legend {
		display: flex;
		gap: 0.8em;
		margin-top: 0.5em;
		font-size: 0.7em;
		opacity: 0.7;
	}

	.key {
		display: flex;
		align-items: center;
		gap: 0.3em;
	}

	.swatch {
		width: 0.6em;
		height: 0.6em;
		border-radius: 0.15em;
	}

	.swatch.correct {
		background: var(--correct);
	}

	.swatch.wrong {
		background: var(--incorrect);
	}

	.swatch.none {
		background: color-mix(in srgb, var(--on-surface) 20%, transparent);
	}
</style>
