import * as m from '$lib/paraglide/messages.js';
import type { LintIssue } from './lint';

export function lintIssueMessage(issue: LintIssue | undefined): string | undefined {
	if (issue === undefined) return undefined;
	switch (issue) {
		case 'no_answers':
			return m.no_answers();
		case 'no_correct':
			return m.no_correct();
		case 'empty_answer':
			return m.empty_answer();
		case 'duplicate_answers':
			return m.duplicate_answers();
		case 'no_media':
			return m.no_media();
		case 'no_target':
			return m.no_target();
		case 'correct_out_of_range':
			return m.correct_out_of_range();
		case 'empty_range':
			return m.empty_range();
		case 'empty_slide':
			return m.empty_slide();
		case 'no_entries':
			return m.no_entries();
	}
}

export function lintIssueTopbarMessage(issue: LintIssue | undefined): string | undefined {
	if (issue === undefined) return undefined;
	switch (issue) {
		case 'no_answers':
			return m.missing_answers();
		case 'no_correct':
			return m.missing_correct();
		case 'empty_answer':
			return m.empty_answer();
		case 'duplicate_answers':
			return m.duplicate_answers();
		case 'no_media':
			return m.no_media();
		case 'no_target':
			return m.no_target();
		case 'correct_out_of_range':
			return m.correct_out_of_range();
		case 'empty_range':
			return m.empty_range();
		case 'empty_slide':
			return m.empty_slide();
		case 'no_entries':
			return m.no_entries();
	}
}
