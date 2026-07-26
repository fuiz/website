import { describe, expect, it } from 'vitest';
import {
	averageScore,
	hardestQuestion,
	overallAccuracy,
	playerRows,
	questionMaxima,
	questionRows,
	reportToCsv,
	scoreLevel
} from '../src/lib/reports';
import type { ReportBody } from '../src/lib/storage';

function makeReport(overrides: Partial<ReportBody> = {}): ReportBody {
	return {
		title: 'Cell biology',
		playedAt: 1_700_000_000_000,
		playerCount: 3,
		questions: [
			{ title: 'What is ATP?', correct: 2, wrong: 1 },
			{ title: 'Name the organelle', correct: 1, wrong: 1 }
		],
		results: [
			['Amina', [1000, 800]],
			['Tomás', [900, 0]],
			['Priya', [0, 0]]
		],
		...overrides
	};
}

describe('playerRows', () => {
	it('ranks by total score and counts positive scores as correct', () => {
		const rows = playerRows(makeReport());

		expect(rows.map((r) => r.name)).toEqual(['Amina', 'Tomás', 'Priya']);
		expect(rows[0].total).toBe(1800);
		expect(rows[0].correctCount).toBe(2);
		expect(rows[2].correctCount).toBe(0);
	});
});

describe('questionRows', () => {
	it('derives unanswered from the player count and never goes negative', () => {
		const rows = questionRows(makeReport());

		expect(rows[0]).toMatchObject({ correct: 2, wrong: 1, unanswered: 0 });
		expect(rows[1]).toMatchObject({ correct: 1, wrong: 1, unanswered: 1 });
	});

	it('clamps unanswered when the aggregate exceeds the player count', () => {
		const rows = questionRows(
			makeReport({ playerCount: 1, questions: [{ title: 'Q', correct: 1, wrong: 1 }] })
		);

		expect(rows[0].unanswered).toBe(0);
	});
});

describe('scoreLevel', () => {
	it('treats a zero score as no points regardless of the maximum', () => {
		expect(scoreLevel(0, 1000)).toBe(0);
	});

	it('buckets by how close the score is to the best on that question', () => {
		expect(scoreLevel(1000, 1000)).toBe(3);
		expect(scoreLevel(600, 1000)).toBe(2);
		expect(scoreLevel(200, 1000)).toBe(1);
	});

	it('gives full intensity when nobody scored, rather than dividing by zero', () => {
		expect(scoreLevel(50, 0)).toBe(3);
	});
});

describe('questionMaxima', () => {
	it('takes the best score per question across all players', () => {
		expect(questionMaxima(makeReport())).toEqual([1000, 800]);
	});
});

describe('aggregates', () => {
	it('computes accuracy over every answerable slot', () => {
		expect(overallAccuracy(makeReport())).toBeCloseTo(3 / 6);
	});

	it('averages the total score per player', () => {
		expect(averageScore(makeReport())).toBe(900);
	});

	it('picks the least accurate question', () => {
		expect(hardestQuestion(makeReport())?.index).toBe(1);
	});

	it('survives a game nobody played', () => {
		const empty = makeReport({ playerCount: 0, questions: [], results: [] });

		expect(overallAccuracy(empty)).toBe(0);
		expect(averageScore(empty)).toBe(0);
		expect(hardestQuestion(empty)).toBeUndefined();
	});
});

describe('reportToCsv', () => {
	it('emits a header row with per-question titles and trailing totals', () => {
		const [header] = reportToCsv(makeReport()).split('\n');

		expect(header).toBe('Name,Q1: What is ATP?,Q2: Name the organelle,Total,Correct');
	});

	it('quotes names containing a comma so columns do not shift', () => {
		const csv = reportToCsv(makeReport({ results: [['Smith, John', [500, 500]]], playerCount: 1 }));

		expect(csv.split('\n')[1]).toBe('"Smith, John",500,500,1000,2/2');
	});

	it('doubles embedded quotes', () => {
		const csv = reportToCsv(makeReport({ results: [['Ann "Ace"', [0, 0]]], playerCount: 1 }));

		expect(csv.split('\n')[1]).toBe('"Ann ""Ace""",0,0,0,0/2');
	});

	it('ranks rows the same way the players list does', () => {
		const names = reportToCsv(makeReport())
			.split('\n')
			.slice(1)
			.map((row) => row.split(',')[0]);

		expect(names).toEqual(['Amina', 'Tomás', 'Priya']);
	});
});
