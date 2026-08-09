import type { ReportBody } from '$lib/storage';
import { toSorted } from '$lib/util';

export type PlayerRow = {
	name: string;
	scores: number[];
	total: number;
	correctCount: number;
};

export type QuestionRow = {
	index: number;
	title: string;
	correct: number;
	wrong: number;
	unanswered: number;
	/** Share of players who got it right, 0-1. */
	accuracy: number;
};

/**
 * There is no per-player correctness flag on the wire; a player's score for a question is
 * all we get, and points are only awarded for a correct answer. So a positive score means
 * correct, and zero covers both wrong and unanswered (which the aggregate stats separate).
 */
export function isCorrect(score: number): boolean {
	return score > 0;
}

/**
 * Whether a question contributes to the scoreboard at all.
 *
 * Opinion slides (free text, polls, unscored pins) award nothing, so every
 * player's score on them is `0`. Printing that `0` in a results sheet reads as
 * "got it wrong" when the truth is "there was nothing to get right", so the
 * exports blank those cells and leave them out of the correct-answer tally.
 *
 * A report that carries no `pointsAwarded` states nothing either way, so it
 * counts as scored: the reading that leaves every cell of its sheet filled.
 */
export function isScored(question: ReportBody['questions'][number]): boolean {
	return question.pointsAwarded === undefined || question.pointsAwarded > 0;
}

/** How many questions could actually earn points, the honest denominator. */
export function scoredQuestionCount(report: ReportBody): number {
	return report.questions.filter(isScored).length;
}

/** Whether a report carries a response log worth exporting. */
export function hasResponses(report: ReportBody): boolean {
	return (report.responses?.length ?? 0) > 0;
}

export function playerRows(report: ReportBody): PlayerRow[] {
	const rows = report.results.map(([name, scores]) => ({
		name,
		scores,
		total: scores.reduce((sum, score) => sum + score, 0),
		correctCount: scores.filter(isCorrect).length
	}));
	return toSorted(rows, (a, b) => b.total - a.total);
}

export function questionRows(report: ReportBody): QuestionRow[] {
	return report.questions.map(({ title, correct, wrong }, index) => ({
		index,
		title,
		correct,
		wrong,
		unanswered: Math.max(0, report.playerCount - correct - wrong),
		accuracy: report.playerCount > 0 ? correct / report.playerCount : 0
	}));
}

/** Best score anyone achieved on each question, used to normalise the heatmap shading. */
export function questionMaxima(report: ReportBody): number[] {
	return report.questions.map((_, index) =>
		report.results.reduce((max, [, scores]) => Math.max(max, scores.at(index) ?? 0), 0)
	);
}

/** 0 for no points, then 1-3 by how close the score was to the best on that question. */
export function scoreLevel(score: number, max: number): 0 | 1 | 2 | 3 {
	if (!isCorrect(score)) return 0;
	if (max <= 0) return 3;
	const ratio = score / max;
	if (ratio >= 0.8) return 3;
	if (ratio >= 0.5) return 2;
	return 1;
}

export function overallAccuracy(report: ReportBody): number {
	const totalCorrect = report.questions.reduce((sum, q) => sum + q.correct, 0);
	const totalAnswerable = report.questions.length * report.playerCount;
	return totalAnswerable > 0 ? totalCorrect / totalAnswerable : 0;
}

export function averageScore(report: ReportBody): number {
	if (report.results.length === 0) return 0;
	const total = report.results.reduce(
		(sum, [, scores]) => sum + scores.reduce((a, b) => a + b, 0),
		0
	);
	return Math.round(total / report.results.length);
}

/** The question the most players got wrong, or undefined when there's nothing to rank. */
export function hardestQuestion(report: ReportBody): QuestionRow | undefined {
	const rows = questionRows(report);
	if (rows.length === 0) return undefined;
	return toSorted(rows, (a, b) => a.accuracy - b.accuracy)[0];
}

function escapeCsvField(value: string): string {
	return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function toCsv(rows: string[][]): string {
	return rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
}

/** The `Q1: ...`, `Q2: ...` column headings both exports share, so the two line up. */
function questionHeader(report: ReportBody): string[] {
	return ['Name', ...report.questions.map((q, index) => `Q${index + 1}: ${q.title}`)];
}

/**
 * The gradebook: what each player scored, ranked.
 *
 * Every field is escaped, because a player called `Smith, John` would otherwise shift every
 * column after it. Unscored questions keep their column, because dropping it would renumber
 * the rest and break the match with the response log, but leave the cell empty rather than
 * claim a zero.
 */
export function reportToCsv(report: ReportBody): string {
	const header = [...questionHeader(report), 'Total', 'Correct'];
	const scoredCount = scoredQuestionCount(report);
	const rows = playerRows(report).map((row) => [
		row.name,
		...report.questions.map((question, index) =>
			isScored(question) ? String(row.scores.at(index) ?? 0) : ''
		),
		String(row.total),
		`${row.correctCount}/${scoredCount}`
	]);
	return toCsv([header, ...rows]);
}

/** Which team each player was on, for a team game's response log. */
function teamByPlayer(report: ReportBody): Map<string, string> {
	const lookup = new Map<string, string>();
	for (const [team, members] of report.teams ?? []) {
		for (const member of members) lookup.set(member, team);
	}
	return lookup;
}

/**
 * The response log: what each player actually said, one row per player.
 *
 * Sorted by name rather than by score, because this sheet is for looking someone up,
 * and half its questions have no score to rank by. Team games get a `Team`
 * column, since answers are recorded per player while the scoreboard is per
 * team, and without it there is nothing tying the two exports together.
 */
export function responsesToCsv(report: ReportBody): string {
	const teams = teamByPlayer(report);
	const header = questionHeader(report);
	const rows = toSorted(report.responses ?? [], ([a], [b]) => a.localeCompare(b)).map(
		([name, answers]) => [
			name,
			...(teams.size > 0 ? [teams.get(name) ?? ''] : []),
			...report.questions.map((_, index) => answers.at(index) ?? '')
		]
	);
	return toCsv([teams.size > 0 ? [header[0], 'Team', ...header.slice(1)] : header, ...rows]);
}

/**
 * Turns the host's per-slide answer lists into one row per player.
 *
 * Keyed by name because that is all the host is handed: the watcher ids the
 * server joins on never leave it. `players` seeds the roster so someone who sat
 * a question out still gets a row with a gap in it, and anyone who answered and
 * then left is added back: their answers are on file even though the final
 * scores forgot them.
 *
 * Returns nothing at all when no answer was ever captured, so a game whose host
 * skipped every results screen doesn't offer an export of blank rows.
 */
export function pivotResponses(
	slideCount: number,
	perSlide: Record<number, { name: string; answer: string }[]>,
	players: string[]
): [string, string[]][] {
	const rows = new Map<string, string[]>();
	const row = (name: string) => {
		const existing = rows.get(name);
		if (existing) return existing;
		const created = Array.from({ length: slideCount }, () => '');
		rows.set(name, created);
		return created;
	};

	for (const player of players) row(player);

	let captured = false;
	for (const [index, responses] of Object.entries(perSlide)) {
		const slide = Number(index);
		if (slide < 0 || slide >= slideCount) continue;
		for (const { name, answer } of responses) {
			row(name)[slide] = answer;
			captured ||= answer !== '';
		}
	}

	return captured ? [...rows] : [];
}
