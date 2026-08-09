import type {
	GenericBrainstormSlide,
	GenericFreeTextSlide,
	GenericFuizConfig,
	GenericInfoSlide,
	GenericMultipleChoiceSlide,
	GenericOrderSlide,
	GenericPinSlide,
	GenericPollSlide,
	GenericScaleSlide,
	GenericSlide,
	GenericSliderSlide,
	GenericTypeAnswer
} from '$lib/types';
import { isDegenerateShape } from './pin/shared/correctness';

export type LintIssue =
	| 'no_answers'
	| 'no_correct'
	| 'empty_answer'
	| 'duplicate_answers'
	| 'no_media'
	| 'no_target'
	| 'correct_out_of_range'
	| 'empty_range'
	| 'empty_slide'
	| 'no_entries';

const ISSUE_PRIORITY: Record<LintIssue, number> = {
	no_answers: 0,
	empty_slide: 1,
	no_entries: 2,
	no_correct: 3,
	no_media: 4,
	no_target: 5,
	empty_range: 6,
	correct_out_of_range: 7,
	empty_answer: 8,
	duplicate_answers: 9
};

function hasDuplicates(values: string[]): boolean {
	return new Set(values).size !== values.length;
}

export function lintMultipleChoice<T>(slide: GenericMultipleChoiceSlide<T>): LintIssue | undefined {
	if (slide.answers.length === 0) return 'no_answers';
	if (slide.answers.every((a) => !a.correct)) return 'no_correct';
	if (slide.answers.some((a) => !a.content.Text.length)) return 'empty_answer';
	if (hasDuplicates(slide.answers.map((a) => a.content.Text))) return 'duplicate_answers';
	return undefined;
}

export function lintTypeAnswer<T>(slide: GenericTypeAnswer<T>): LintIssue | undefined {
	if (slide.answers.length === 0) return 'no_answers';
	if (slide.answers.some((a) => !a.text.length)) return 'empty_answer';
	if (hasDuplicates(slide.answers.map((a) => a.text))) return 'duplicate_answers';
	return undefined;
}

export function lintOrder<T>(slide: GenericOrderSlide<T>): LintIssue | undefined {
	if (slide.answers.length === 0) return 'no_answers';
	if (slide.answers.some((a) => !a.text.length)) return 'empty_answer';
	if (hasDuplicates(slide.answers.map((a) => a.text))) return 'duplicate_answers';
	return undefined;
}

export function lintPoll<T>(slide: GenericPollSlide<T>): LintIssue | undefined {
	if (slide.answers.length === 0) return 'no_answers';
	if (slide.answers.some((a) => !a.content.Text.length)) return 'empty_answer';
	if (hasDuplicates(slide.answers.map((a) => a.content.Text))) return 'duplicate_answers';
	return undefined;
}

export function lintSlider<T>(slide: GenericSliderSlide<T>): LintIssue | undefined {
	const { min, max, step } = slide.range;
	if (!(max > min) || !(step > 0)) return 'empty_range';
	if (slide.correct < min || slide.correct > max) return 'correct_out_of_range';
	return undefined;
}

export function lintScale<T>(slide: GenericScaleSlide<T>): LintIssue | undefined {
	if (slide.max <= slide.min) return 'empty_range';
	return undefined;
}

export function lintPin<T>(slide: GenericPinSlide<T>): LintIssue | undefined {
	// There is nothing to aim at, or even to look at, without an image.
	if (!slide.media) return 'no_media';
	// A target that encloses no area means nobody can ever be right.
	if (slide.correct_area && isDegenerateShape(slide.correct_area)) return 'no_target';
	return undefined;
}

export function lintFreeText<T>(slide: GenericFreeTextSlide<T>): LintIssue | undefined {
	// Not `no_answers`: the slide is fine, the budget just leaves nobody a turn.
	if (slide.max_entries < 1) return 'no_entries';
	return undefined;
}

export function lintBrainstorm<T>(slide: GenericBrainstormSlide<T>): LintIssue | undefined {
	if (slide.max_ideas_per_player < 1) return 'no_entries';
	return undefined;
}

export function lintInfoSlide<T>(slide: GenericInfoSlide<T>): LintIssue | undefined {
	// An info slide has no answers to be missing; what it can lack is anything
	// to show. Reusing `no_answers` here would tell the author to "Add answers"
	// on a slide that asks nothing.
	if (!slide.title.length && !slide.body?.length && !slide.media) return 'empty_slide';
	return undefined;
}

export function lintSlide<T>(slide: GenericSlide<T>): LintIssue | undefined {
	if ('MultipleChoice' in slide) return lintMultipleChoice(slide.MultipleChoice);
	if ('TypeAnswer' in slide) return lintTypeAnswer(slide.TypeAnswer);
	if ('Order' in slide) return lintOrder(slide.Order);
	if ('Poll' in slide) return lintPoll(slide.Poll);
	if ('Slider' in slide) return lintSlider(slide.Slider);
	if ('Scale' in slide) return lintScale(slide.Scale);
	if ('Pin' in slide) return lintPin(slide.Pin);
	if ('FreeText' in slide) return lintFreeText(slide.FreeText);
	if ('Brainstorm' in slide) return lintBrainstorm(slide.Brainstorm);
	if ('InfoSlide' in slide) return lintInfoSlide(slide.InfoSlide);
	return undefined;
}

export function lintConfig<T>(config: GenericFuizConfig<T>): LintIssue | undefined {
	let worst: LintIssue | undefined;
	for (const slide of config.slides) {
		const issue = lintSlide(slide);
		if (issue === undefined) continue;
		if (worst === undefined || ISSUE_PRIORITY[issue] < ISSUE_PRIORITY[worst]) {
			worst = issue;
		}
	}
	return worst;
}
