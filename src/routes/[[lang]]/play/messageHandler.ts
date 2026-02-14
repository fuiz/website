import { addIds } from '$lib/clientOnly';
import * as m from '$lib/paraglide/messages.js';
import type {
	GameIncomingMessage,
	MultipleChoiceIncomingMessage,
	NameError,
	OrderSlideIncomingMessage,
	State,
	TypeAnswerIncomingMessage
} from './index';

// Game message types
export interface GameMessageContext {
	code: string;
	currentState: State | undefined;
	watcherId: string | undefined;
	previousIndex: number;
	previousCount: number;
	previousScore: number;
}

export interface GameMessageResult {
	newState?: State;
	newWatcherId?: string;
	shouldMarkFinished?: boolean;
	shouldCloseSocket?: boolean;
	newSetName?: string;
	newLeaderboardName?: string;
	newPoints?: number;
	newShowAnswers?: boolean;
}

// Question message types
export interface QuestionMessageContext {
	currentState: State | undefined;
	previousIndex: number;
	previousCount: number;
	previousScore: number;
}

export interface QuestionMessageResult {
	newState?: State;
}

function nameErrorToMessage(nameError: NameError): string {
	switch (nameError) {
		case 'Used':
			return m.in_use();
		case 'Assigned':
			return m.have_name();
		case 'Empty':
			return m.cannot_empty();
		case 'Sinful':
			return m.inappropriate();
		case 'TooLong':
			return m.too_long();
		default:
			return '';
	}
}

/**
 * Handles incoming Game messages
 */
export function handleGameMessage(
	game: GameIncomingMessage,
	context: GameMessageContext
): GameMessageResult {
	if (game === 'NameChoose') {
		return {
			newState: {
				Game: {
					NameChoose: {
						sending: false,
						error: ''
					}
				}
			}
		};
	}

	if ('NameAssign' in game) {
		return {
			newState: undefined,
			newSetName: game.NameAssign
		};
	}

	if ('NameError' in game) {
		return {
			newState: {
				Game: {
					NameChoose: {
						sending: false,
						error: nameErrorToMessage(game.NameError)
					}
				}
			}
		};
	}

	if ('Score' in game) {
		const { index, count, score } = game.Score;

		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: score?.points ?? context.previousScore,
				Slide: {
					Score: {
						points: score?.points ?? context.previousScore,
						position: score?.position ?? undefined
					}
				}
			}
		};
	}

	if ('WaitingScreen' in game) {
		const { exact_count } = game.WaitingScreen;
		return {
			newState: {
				Game: {
					WaitingScreen: {
						exact_count
					}
				}
			}
		};
	}

	if ('IdAssign' in game) {
		return {
			newWatcherId: game.IdAssign
		};
	}

	if ('Metainfo' in game) {
		const { score, show_answers } = game.Metainfo.Player;
		return {
			newPoints: score,
			newShowAnswers: show_answers
		};
	}

	if ('Summary' in game) {
		return {
			newState: {
				Game: {
					Summary: {
						...game.Summary.Player,
						score: game.Summary.Player.score ?? undefined,
						config: addIds(game.Summary.Player.config)
					}
				}
			},
			shouldMarkFinished: true,
			shouldCloseSocket: true
		};
	}

	if ('FindTeam' in game) {
		return {
			newState: {
				Game: {
					FindTeam: game.FindTeam
				}
			},
			newLeaderboardName: game.FindTeam
		};
	}

	if ('ChooseTeammates' in game) {
		return {
			newState: {
				Game: {
					ChooseTeammates: game.ChooseTeammates
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming MultipleChoice messages
 */
export function handleMultipleChoiceMessage(
	mc: MultipleChoiceIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous_state =
		context.currentState &&
		'Slide' in context.currentState &&
		'MultipleChoice' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;

	if ('QuestionAnnouncement' in mc) {
		const { index, count, question, media } = mc.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'QuestionAnnouncement',
					question,
					media: media ?? undefined
				}
			}
		};
	}

	if ('AnswersAnnouncement' in mc) {
		const { index, count, question, media, answers } = mc.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'AnswersAnnouncement',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers: answers.map((a) => {
						if (a === 'Hidden') return undefined;
						return a.Visible;
					})
				}
			}
		};
	}

	if ('AnswersResults' in mc) {
		const { index, count, question, media, answers, results } = mc.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers,
					results,
					answered: previous_state?.answered
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming TypeAnswer messages
 */
export function handleTypeAnswerMessage(
	ta: TypeAnswerIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous_state =
		context.currentState &&
		'Slide' in context.currentState &&
		'TypeAnswer' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;

	if ('QuestionAnnouncement' in ta) {
		const { index, count, question, media, accept_answers } = ta.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					TypeAnswer: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					accept_answers
				}
			}
		};
	}

	if ('AnswersResults' in ta) {
		const { index, count, question, media, answers, results, case_sensitive } = ta.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					TypeAnswer: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers,
					results,
					case_sensitive,
					answered: previous_state?.answered
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming Order messages
 */
export function handleOrderMessage(
	order: OrderSlideIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous_state =
		context.currentState && 'Slide' in context.currentState && 'Order' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;

	if ('QuestionAnnouncement' in order) {
		const { index, count, question, media } = order.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					Order: 'QuestionAnnouncement',
					question,
					media: media ?? undefined
				}
			}
		};
	}

	if ('AnswersAnnouncement' in order) {
		const { index, count, question, media, answers, axis_labels } = order.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Order: 'AnswersAnnouncement',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers,
					axis_labels: {
						from: axis_labels?.from ?? undefined,
						to: axis_labels?.to ?? undefined
					},
					answered: previous_state?.answered
				}
			}
		};
	}

	if ('AnswersResults' in order) {
		const { index, count, question, media, axis_labels, answers, results } = order.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Order: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers,
					results,
					answered: previous_state?.answered,
					axis_labels: {
						from: axis_labels?.from ?? previous_state?.axis_labels?.from,
						to: axis_labels?.to ?? previous_state?.axis_labels?.to
					}
				}
			}
		};
	}

	return {};
}
