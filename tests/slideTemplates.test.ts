import { describe, expect, it } from 'vitest';
import { fixTimes, limits, removeIds } from '../src/lib/clientOnly';
import { type LintIssue, lintSlide } from '../src/lib/question-types/lint';
import { isDegenerateShape, isPinOnTarget } from '../src/lib/question-types/pin/shared/correctness';
import { getQuestionType, type PinShape, questionTypes, type Slide } from '../src/lib/types';
import { slideGroups, slideTemplates } from '../src/routes/[[lang]]/create/slideTemplates';

/** Every slide the add-slide picker can produce, freshly created. */
function everyTemplateSlide(): Slide[] {
	return slideTemplates.map((template, index) => template.create(index));
}

/**
 * The payload the backend actually receives for a slide: the id-stripping and
 * seconds-to-milliseconds passes the play button runs before posting.
 */
function asSentToBackend(slide: Slide) {
	return fixTimes(removeIds({ title: 'Test', slides: [slide] })).slides[0];
}

describe('add-slide templates', () => {
	it('covers all fourteen Kahoot slide types', () => {
		expect(slideTemplates).toHaveLength(14);
		expect(new Set(slideTemplates.map((t) => t.key)).size).toBe(14);
	});

	it('places every template in one of the three groups', () => {
		const groups = new Set(slideGroups.map((g) => g.group));
		for (const template of slideTemplates) {
			expect(groups.has(template.group)).toBe(true);
		}
	});

	it('exercises every question type the union declares', () => {
		const produced = new Set(everyTemplateSlide().map(getQuestionType));
		expect([...produced].sort()).toEqual([...questionTypes].sort());
	});

	it('gives every template a label and a description', () => {
		for (const template of slideTemplates) {
			expect(template.label().length).toBeGreaterThan(0);
			expect(template.description().length).toBeGreaterThan(0);
		}
	});

	it('survives the id-stripping and time-fixing passes unchanged in shape', () => {
		for (const slide of everyTemplateSlide()) {
			const sent = asSentToBackend(slide);
			// The slide keeps its kind and loses its editor-only id.
			expect(getQuestionType(sent)).toBe(getQuestionType(slide));
			expect('id' in sent).toBe(false);
		}
	});

	it('sends durations in milliseconds', () => {
		for (const slide of everyTemplateSlide()) {
			const body = Object.values(asSentToBackend(slide))[0] as Record<string, unknown>;
			for (const field of [
				'introduce_question',
				'time_limit',
				'idea_time_limit',
				'vote_time_limit',
				'duration'
			]) {
				const value = body[field];
				if (typeof value === 'number' && value !== 0) {
					// Anything under a second would be a seconds value that never
					// got scaled up, which is what `fixTimes` exists to prevent.
					expect(value).toBeGreaterThanOrEqual(1000);
				}
			}
		}
	});

	it('marks opinion and info templates as unscored', () => {
		for (const template of slideTemplates) {
			if (template.group !== 'test') {
				const body = Object.values(template.create(0))[0] as { points_awarded?: number };
				expect(body.points_awarded ?? 0).toBe(0);
			}
		}
	});

	it('starts scored templates on the site default points', () => {
		for (const template of slideTemplates) {
			if (template.group === 'test') {
				const body = Object.values(template.create(0))[0] as { points_awarded?: number };
				expect(body.points_awarded).toBe(limits.fuiz.multipleChoice.pointsAwarded);
			}
		}
	});

	it('only flags the templates an author still has to fill in', () => {
		const issues = Object.fromEntries(
			slideTemplates.map((template) => [template.key, lintSlide(template.create(0))])
		);

		// Choice-style slides start empty, so they ask for answers up front.
		expect(issues.quiz).toBe('no_answers');
		expect(issues.poll).toBe('no_answers');
		expect(issues.puzzle).toBe('no_answers');
		expect(issues['type-answer']).toBe('no_answers');
		// Pin slides need an image before they mean anything.
		expect(issues['pin-answer']).toBe('no_media');
		expect(issues['drop-pin']).toBe('no_media');
		// The rest are playable the moment they're added.
		expect(issues.slider).toBeUndefined();
		expect(issues.scale).toBeUndefined();
		expect(issues.nps).toBeUndefined();
		expect(issues['word-cloud']).toBeUndefined();
		expect(issues['open-ended']).toBeUndefined();
		expect(issues.brainstorm).toBeUndefined();
	});

	it('pre-fills true/false with two opposing options', () => {
		const slide = slideTemplates.find((t) => t.key === 'true-false')?.create(0);
		expect(slide && 'MultipleChoice' in slide).toBe(true);
		if (!slide || !('MultipleChoice' in slide)) return;

		const answers = slide.MultipleChoice.answers;
		expect(answers).toHaveLength(2);
		expect(answers.filter((a) => a.correct)).toHaveLength(1);
		// A ready-made true/false question has nothing left to lint.
		expect(lintSlide(slide)).toBeUndefined();
	});

	it('fixes the NPS range at 0-10 and leaves agreement scales short', () => {
		const nps = slideTemplates.find((t) => t.key === 'nps')?.create(0);
		const agreement = slideTemplates.find((t) => t.key === 'scale')?.create(0);
		if (!nps || !('Scale' in nps) || !agreement || !('Scale' in agreement)) {
			throw new Error('scale templates missing');
		}

		expect(nps.Scale.style).toBe('Nps');
		expect(nps.Scale.min).toBe(0);
		expect(nps.Scale.max).toBe(10);

		expect(agreement.Scale.style).toBe('Agreement');
		expect(agreement.Scale.min).toBe(1);
		expect(agreement.Scale.max).toBe(limits.fuiz.scale.defaultAgreementMax);
	});

	it('gives a pin answer a drawable target and a drop pin none', () => {
		const pin = slideTemplates.find((t) => t.key === 'pin-answer')?.create(0);
		const drop = slideTemplates.find((t) => t.key === 'drop-pin')?.create(0);
		if (!pin || !('Pin' in pin) || !drop || !('Pin' in drop)) {
			throw new Error('pin templates missing');
		}

		// A pin answer starts with an ellipse the author can redraw; a drop pin
		// has no target at all.
		expect(pin.Pin.correct_area).not.toBeNull();
		expect(isDegenerateShape(pin.Pin.correct_area)).toBe(false);
		expect(drop.Pin.correct_area).toBeNull();
	});

	it('scores a pin by whether it lands inside the drawn shape', () => {
		const shapes: PinShape[] = [
			{ Rectangle: { x: 0.2, y: 0.2, width: 0.3, height: 0.3 } },
			{ Ellipse: { center: { x: 0.35, y: 0.35 }, radius_x: 0.15, radius_y: 0.15 } },
			{
				Polygon: {
					points: [
						{ x: 0.2, y: 0.2 },
						{ x: 0.5, y: 0.2 },
						{ x: 0.5, y: 0.5 },
						{ x: 0.2, y: 0.5 }
					]
				}
			}
		];
		for (const shape of shapes) {
			expect(isPinOnTarget({ x: 0.35, y: 0.35 }, shape)).toBe(true);
			expect(isPinOnTarget({ x: 0.9, y: 0.9 }, shape)).toBe(false);
		}
	});

	it('treats an empty shape as scoring nothing', () => {
		expect(isDegenerateShape({ Rectangle: { x: 0.5, y: 0.5, width: 0, height: 0.2 } })).toBe(true);
		expect(isDegenerateShape({ Polygon: { points: [{ x: 0, y: 0 }] } })).toBe(true);
		expect(isPinOnTarget({ x: 0.5, y: 0.5 }, { Polygon: { points: [{ x: 0, y: 0 }] } })).toBe(
			false
		);
	});

	it('never reports an answer problem on a slide that has no answers', () => {
		// An info slide asks nothing, so "Add answers" is not advice it can act
		// on. Same for the entry budgets: the slide is fine, the budget is not.
		const ANSWER_SHAPED: LintIssue[] = [
			'no_answers',
			'no_correct',
			'empty_answer',
			'duplicate_answers'
		];
		const answerless = [
			'info-slide',
			'word-cloud',
			'open-ended',
			'brainstorm',
			'slider',
			'scale',
			'nps'
		];

		for (const key of answerless) {
			const template = slideTemplates.find((t) => t.key === key);
			if (!template) throw new Error(`missing template: ${key}`);
			const issue = lintSlide(template.create(0));
			expect(issue === undefined || !ANSWER_SHAPED.includes(issue)).toBe(true);
		}
	});

	it('tells an empty info slide what it is actually missing', () => {
		const slide = slideTemplates.find((t) => t.key === 'info-slide')?.create(0);
		if (!slide) throw new Error('info slide template missing');
		expect(lintSlide(slide)).toBe('empty_slide');
	});

	it('separates word cloud from open ended by entry budget', () => {
		const cloud = slideTemplates.find((t) => t.key === 'word-cloud')?.create(0);
		const open = slideTemplates.find((t) => t.key === 'open-ended')?.create(0);
		if (!cloud || !('FreeText' in cloud) || !open || !('FreeText' in open)) {
			throw new Error('free-text templates missing');
		}

		expect(cloud.FreeText.mode).toBe('WordCloud');
		expect(cloud.FreeText.max_entries).toBeGreaterThan(1);
		expect(open.FreeText.mode).toBe('OpenEnded');
		expect(open.FreeText.max_entries).toBe(1);
	});
});
