import * as m from '$lib/paraglide/messages.js';
import type { RecapVerdict } from './context';

/** The verdict in words, for screen readers and the recap card. */
export function verdictLabel(verdict: RecapVerdict): string {
	switch (verdict) {
		case 'Correct':
			return m.correct();
		case 'Partial':
			return m.partly_correct();
		case 'Incorrect':
			return m.wrong();
		case 'Unanswered':
			return m.no_answer();
		case 'Recorded':
			return m.answer_recorded();
	}
}
