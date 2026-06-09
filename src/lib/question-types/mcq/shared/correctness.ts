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

export type McqAnswerStatus = 'found' | 'missed' | 'wrong' | 'avoided';

export type MultipleAnswersReview = {
	statuses: McqAnswerStatus[];
	foundCount: number;
	missedCount: number;
	wrongCount: number;
	totalCorrect: number;
	isPerfect: boolean;
};

/**
 * Classifies every answer of a multiple-answers question into one of four states,
 * so the player can see what they found, missed, and wrongly picked.
 */
export function getMultipleAnswersReview(
	answered: number | number[] | undefined,
	results: AnswerResult[] | undefined
): MultipleAnswersReview {
	const safeResults = results ?? [];
	const picks = answered === undefined ? [] : Array.isArray(answered) ? answered : [answered];

	const statuses: McqAnswerStatus[] = safeResults.map((result, index) => {
		const picked = picks.includes(index);
		if (result.correct) return picked ? 'found' : 'missed';
		return picked ? 'wrong' : 'avoided';
	});

	const count = (status: McqAnswerStatus) => statuses.filter((s) => s === status).length;
	const foundCount = count('found');
	const missedCount = count('missed');
	const wrongCount = count('wrong');

	return {
		statuses,
		foundCount,
		missedCount,
		wrongCount,
		totalCorrect: foundCount + missedCount,
		isPerfect: missedCount === 0 && wrongCount === 0
	};
}
