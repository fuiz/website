import { getContext, setContext } from 'svelte';

/** How a player's answer to a finished slide fared. */
export type RecapVerdict = 'Correct' | 'Partial' | 'Incorrect' | 'Unanswered' | 'Recorded';

/** One finished slide from the player's side, for their recap. */
export type RecapEntry = {
	index: number;
	/** The question's number as players count them, from 1. Info slides take none. */
	number: number;
	question: string;
	answer?: string | null;
	correct_answer?: string | null;
	/** Whether the slide has a right answer. Polls and other opinion slides do not. */
	graded: boolean;
	verdict: RecapVerdict;
	/** Absent when the game hides scores. */
	points?: number | null;
};

/**
 * The player's recap as every player screen sees it: the finished slides, and
 * which of them, if any, is open in place of the game.
 */
export type Recap = {
	readonly entries: RecapEntry[];
	/** The slide index open in place of the game, or `undefined` for the game. */
	readonly viewing: number | undefined;
	/** Whether the player still owes an answer on screen, which the recap must not pull them away from. */
	readonly locked: boolean;
	view(index: number | undefined): void;
};

const key = Symbol('recap');

export function setRecap(recap: Recap) {
	setContext(key, recap);
}

/** `undefined` outside a game, like the demo pages. */
export function getRecap(): Recap | undefined {
	return getContext<Recap | undefined>(key);
}
