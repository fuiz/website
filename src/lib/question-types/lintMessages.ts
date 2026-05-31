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
	}
}
