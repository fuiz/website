import { describe, expect, it } from 'vitest';
import {
	averageScore,
	hardestQuestion,
	hasResponses,
	overallAccuracy,
	pivotResponses,
	playerRows,
	questionMaxima,
	questionRows,
	reportToCsv,
	responsesToCsv,
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

	it('blanks questions that award no points instead of claiming a zero', () => {
		const csv = reportToCsv(
			makeReport({
				playerCount: 1,
				questions: [
					{ title: 'What is ATP?', correct: 1, wrong: 0, pointsAwarded: 1000 },
					{ title: 'Your study programme?', correct: 0, wrong: 0, pointsAwarded: 0 }
				],
				results: [['Amina', [1000, 0]]]
			})
		);

		expect(csv.split('\n')[1]).toBe('Amina,1000,,1000,1/1');
	});

	it('keeps the unscored column so question numbers still line up', () => {
		const [header] = reportToCsv(
			makeReport({
				questions: [
					{ title: 'What is ATP?', correct: 1, wrong: 0, pointsAwarded: 1000 },
					{ title: 'Your study programme?', correct: 0, wrong: 0, pointsAwarded: 0 }
				]
			})
		).split('\n');

		expect(header).toBe('Name,Q1: What is ATP?,Q2: Your study programme?,Total,Correct');
	});
});

describe('pivotResponses', () => {
	it('lays each slide out as a column against the player who answered it', () => {
		const rows = pivotResponses(
			2,
			{
				0: [
					{ name: 'Amina', answer: 'Mitochondria' },
					{ name: 'Tomás', answer: 'Ribosome' }
				],
				1: [{ name: 'Amina', answer: 'Physics' }]
			},
			['Amina', 'Tomás']
		);

		expect(rows).toEqual([
			['Amina', ['Mitochondria', 'Physics']],
			['Tomás', ['Ribosome', '']]
		]);
	});

	it('keeps a row for a player who answered nothing, so the gap is visible', () => {
		const rows = pivotResponses(1, { 0: [{ name: 'Amina', answer: 'Physics' }] }, [
			'Amina',
			'Priya'
		]);

		expect(rows).toContainEqual(['Priya', ['']]);
	});

	it('adds back someone who answered and then left before the final scores', () => {
		const rows = pivotResponses(1, { 0: [{ name: 'Ghost', answer: 'Chemistry' }] }, ['Amina']);

		expect(rows).toContainEqual(['Ghost', ['Chemistry']]);
	});

	it('returns nothing when no answer was ever captured', () => {
		expect(pivotResponses(2, {}, ['Amina', 'Tomás'])).toEqual([]);
	});

	it('ignores a slide index the config does not have', () => {
		const rows = pivotResponses(1, { 5: [{ name: 'Amina', answer: 'stray' }] }, ['Amina']);

		expect(rows).toEqual([]);
	});
});

describe('responsesToCsv', () => {
	function withResponses() {
		return makeReport({
			responses: [
				['Tomás', ['Ribosome', 'Maths']],
				['Amina', ['Mitochondria', 'Physics']]
			]
		});
	}

	it('shares its question columns with the results export', () => {
		const report = withResponses();

		expect(responsesToCsv(report).split('\n')[0]).toBe(
			reportToCsv(report).split('\n')[0].replace(',Total,Correct', '')
		);
	});

	it('sorts by name, because this sheet is for looking someone up', () => {
		const names = responsesToCsv(withResponses())
			.split('\n')
			.slice(1)
			.map((row) => row.split(',')[0]);

		expect(names).toEqual(['Amina', 'Tomás']);
	});

	it('escapes an answer containing a comma', () => {
		const csv = responsesToCsv(makeReport({ responses: [['Amina', ['Yes, always', 'Physics']]] }));

		expect(csv.split('\n')[1]).toBe('Amina,"Yes, always",Physics');
	});

	it('pads a row that is short of the question count', () => {
		const csv = responsesToCsv(makeReport({ responses: [['Amina', ['Mitochondria']]] }));

		expect(csv.split('\n')[1]).toBe('Amina,Mitochondria,');
	});

	it('names each player their team, since the scoreboard only knows teams', () => {
		const csv = responsesToCsv(
			makeReport({
				teams: [['Red', ['Amina', 'Priya']]],
				responses: [['Amina', ['Mitochondria', 'Physics']]]
			})
		);

		expect(csv.split('\n')[0]).toBe('Name,Team,Q1: What is ATP?,Q2: Name the organelle');
		expect(csv.split('\n')[1]).toBe('Amina,Red,Mitochondria,Physics');
	});

	it('leaves the team cell empty for someone no team claims', () => {
		const csv = responsesToCsv(
			makeReport({
				teams: [['Red', ['Priya']]],
				responses: [['Amina', ['Mitochondria', 'Physics']]]
			})
		);

		expect(csv.split('\n')[1]).toBe('Amina,,Mitochondria,Physics');
	});
});

describe('hasResponses', () => {
	it('is false for a report saved before answers were recorded', () => {
		expect(hasResponses(makeReport())).toBe(false);
	});

	it('is true once there is a log to export', () => {
		expect(hasResponses(makeReport({ responses: [['Amina', ['Physics', '']]] }))).toBe(true);
	});
});
