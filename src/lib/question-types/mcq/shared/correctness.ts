import { type AnswerMode, type AnswerResult, DEFAULT_ANSWER_MODE } from '$lib/types';

function isSingleAnswerCorrect(answered: number | number[], results: AnswerResult[]): boolean {
	if (Array.isArray(answered)) return false;
	return results.at(answered)?.correct ?? false;
}

function areAllAnsweredCorrect(answered: number[], results: AnswerResult[]): boolean {
	return answered.every((index) => isSingleAnswerCorrect(index, results));
}

function areAllCorrectAnswered(answered: number[], results: AnswerResult[]): boolean {
	return results.every((result, index) => !result.correct || answered.includes(index));
}

function isMultipleAnswersCorrect(answered: number | number[], results: AnswerResult[]): boolean {
	if (!Array.isArray(answered)) return false;
	return areAllAnsweredCorrect(answered, results) && areAllCorrectAnswered(answered, results);
}

export function isMcqAnswerCorrect(
	answered: number | number[] | undefined,
	results: AnswerResult[] | undefined,
	answerMode: AnswerMode = DEFAULT_ANSWER_MODE
): boolean {
	if (answered === undefined || results === undefined) return false;

	switch (answerMode) {
		case 'SingleAnswer':
			return isSingleAnswerCorrect(answered, results);
		case 'MultipleAnswers':
			return isMultipleAnswersCorrect(answered, results);
	}
}
