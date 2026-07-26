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
	/** Share of players who got it right, 0–1. */
	accuracy: number;
};

/**
 * There is no per-player correctness flag on the wire — a player's score for a question is
 * all we get, and points are only awarded for a correct answer. So a positive score means
 * correct, and zero covers both wrong and unanswered (which the aggregate stats separate).
 */
export function isCorrect(score: number): boolean {
	return score > 0;
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

/** 0 for no points, then 1–3 by how close the score was to the best on that question. */
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

/**
 * The old inline export emitted bare `name,scores...` with no header and no escaping, so a
 * player called `Smith, John` silently shifted every column after it.
 */
export function reportToCsv(report: ReportBody): string {
	const header = [
		'Name',
		...report.questions.map((q, index) => `Q${index + 1}: ${q.title}`),
		'Total',
		'Correct'
	];
	const rows = playerRows(report).map((row) => [
		row.name,
		...row.scores.map(String),
		String(row.total),
		`${row.correctCount}/${report.questions.length}`
	]);
	return [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n');
}
