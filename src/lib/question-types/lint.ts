import type {
	GenericFuizConfig,
	GenericMultipleChoiceSlide,
	GenericOrderSlide,
	GenericSlide,
	GenericTypeAnswer
} from '$lib/types';

export type LintIssue = 'no_answers' | 'no_correct' | 'empty_answer' | 'duplicate_answers';

const ISSUE_PRIORITY: Record<LintIssue, number> = {
	no_answers: 0,
	no_correct: 1,
	empty_answer: 2,
	duplicate_answers: 3
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

export function lintSlide<T>(slide: GenericSlide<T>): LintIssue | undefined {
	if ('MultipleChoice' in slide) return lintMultipleChoice(slide.MultipleChoice);
	if ('TypeAnswer' in slide) return lintTypeAnswer(slide.TypeAnswer);
	if ('Order' in slide) return lintOrder(slide.Order);
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
