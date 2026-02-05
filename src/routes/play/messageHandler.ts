import type { State } from './index';
import type {
	GameIncomingMessage,
	MultipleChoiceIncomingMessage,
	TypeAnswerIncomingMessage,
	OrderSlideIncomingMessage
} from './index';
import * as m from '$lib/paraglide/messages.js';

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
		let errorMessage = '';
		if (game.NameError === 'Used') {
			errorMessage = m.in_use();
		} else if (game.NameError === 'Assigned') {
			errorMessage = m.have_name();
		} else if (game.NameError === 'Empty') {
			errorMessage = m.cannot_empty();
		} else if (game.NameError === 'Sinful') {
			errorMessage = m.inappropriate();
		} else if (game.NameError === 'TooLong') {
			errorMessage = m.too_long();
		}
		return {
			newState: {
				Game: {
					NameChoose: {
						sending: false,
						error: errorMessage
					}
				}
			}
		};
	}

	if ('Score' in game) {
		const {
			index = context.previousIndex,
			count = context.previousCount,
			score: { points, position } = {
				points: context.previousScore,
				position: undefined
			}
		} = game.Score;

		return {
			newState: {
				index,
				count,
				score: points,
				Slide: {
					Score: {
						points,
						position
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
		const watcherId = game.IdAssign;
		localStorage.setItem(context.code + '_play', watcherId);
		return {
			newWatcherId: watcherId
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
					Summary: game.Summary.Player
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
					media
				}
			}
		};
	}

	if ('AnswersAnnouncement' in mc) {
		const {
			index = context.previousIndex,
			count = context.previousCount,
			question = previous_state?.question,
			media = previous_state?.media,
			answers
		} = mc.AnswersAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'AnswersAnnouncement',
					question,
					media,
					answers: answers.map((a) => {
						if (a === 'Hidden') return undefined;
						return a.Visible;
					})
				}
			}
		};
	}

	if ('AnswersResults' in mc) {
		const {
			index = context.previousIndex,
			count = context.previousCount,
			question = previous_state?.question,
			media = previous_state?.media,
			answers,
			results
		} = mc.AnswersResults;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'AnswersResults',
					question,
					media,
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
					media,
					accept_answers
				}
			}
		};
	}

	if ('AnswersResults' in ta) {
		const {
			index = context.previousIndex,
			count = context.previousCount,
			question = previous_state?.question,
			media = previous_state?.media,
			answers,
			results,
			case_sensitive
		} = ta.AnswersResults;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					TypeAnswer: 'AnswersResults',
					question,
					media,
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
					media
				}
			}
		};
	}

	if ('AnswersAnnouncement' in order) {
		const {
			index = context.previousIndex,
			count = context.previousCount,
			question = previous_state?.question,
			media = previous_state?.media,
			answers,
			axis_labels
		} = order.AnswersAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					Order: 'AnswersAnnouncement',
					question,
					media,
					answers,
					axis_labels,
					answered: previous_state?.answered
				}
			}
		};
	}

	if ('AnswersResults' in order) {
		const {
			index = context.previousIndex,
			count = context.previousCount,
			question = previous_state?.question,
			media = previous_state?.media,
			axis_labels = previous_state?.axis_labels,
			answers,
			results
		} = order.AnswersResults;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					Order: 'AnswersResults',
					question,
					media,
					answers,
					results,
					answered: previous_state?.answered,
					axis_labels
				}
			}
		};
	}

	return {};
}
