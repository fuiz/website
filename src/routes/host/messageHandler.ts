import type { State } from './index';
import type {
	GameIncomingMessage,
	MultipleChoiceIncomingMessage,
	TypeAnswerIncomingMessage,
	OrderSlideIncomingMessage
} from './index';

// Game message types
export interface GameMessageContext {
	code: string;
	currentState: State | undefined;
	watcherId: string | undefined;
	bindableGameInfo: {
		volumeOn: boolean;
		locked: boolean;
	};
}

export interface GameMessageResult {
	newState?: State;
	newWatcherId?: string;
	shouldCloseSocket?: boolean;
	shouldMarkFinished?: boolean;
	newLockStatus?: boolean;
}

// Question message types
export interface QuestionMessageContext {
	currentState: State | undefined;
}

export interface QuestionMessageResult {
	newState?: State;
	timer?: number;
	initialTimer?: number;
}

/**
 * Handles incoming Game messages
 */
export function handleGameMessage(
	game: GameIncomingMessage,
	context: GameMessageContext
): GameMessageResult {
	if ('WaitingScreen' in game) {
		return {
			newState: {
				Game: {
					WaitingScreen: game.WaitingScreen
				}
			}
		};
	}

	if ('TeamDisplay' in game) {
		return {
			newState: {
				Game: {
					WaitingScreen: game.TeamDisplay
				}
			}
		};
	}

	if ('Leaderboard' in game) {
		const { index: previous_index = 0, count: previous_count = 1 } =
			context.currentState && 'Slide' in context.currentState ? context.currentState : {};

		return {
			newState: {
				index: game.Leaderboard.index || previous_index,
				count: game.Leaderboard.count || previous_count,
				Slide: {
					Leaderboard: game.Leaderboard.leaderboard
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
		return {
			newLockStatus: game.Metainfo.Host.locked
		};
	}

	if ('Summary' in game) {
		return {
			newState: {
				Game: {
					Summary: {
						...game.Summary.Host,
						team_mapping: Object.fromEntries(game.Summary.Host.team_mapping),
						results: Object.fromEntries(game.Summary.Host.results)
					}
				}
			},
			shouldMarkFinished: true,
			shouldCloseSocket: true
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

	const { index: previous_index = 0, count: previous_count = 1 } =
		context.currentState && 'Slide' in context.currentState ? context.currentState : {};

	if ('QuestionAnnouncement' in mc) {
		const { index, count, question, media, duration } = mc.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					MultipleChoice: 'QuestionAnnouncement',
					question,
					media
				}
			},
			timer: duration,
			initialTimer: duration
		};
	}

	if ('AnswersAnnouncement' in mc) {
		const {
			index = previous_index,
			count = previous_count,
			question = previous_state?.question,
			media = previous_state?.media,
			duration,
			answers,
			answered_count
		} = mc.AnswersAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					MultipleChoice: 'AnswersAnnouncement',
					question,
					media,
					answers: answers.map((a) => {
						if (a == 'Hidden') return undefined;
						return a.Visible;
					}),
					answered_count
				}
			},
			timer: duration,
			initialTimer: duration
		};
	}

	if ('AnswersCount' in mc) {
		return {
			newState: {
				...(context.currentState || { index: previous_index, count: previous_count }),
				Slide: {
					...previous_state,
					MultipleChoice: previous_state?.MultipleChoice ?? 'AnswersAnnouncement',
					answered_count: mc.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in mc) {
		const {
			index = previous_index,
			count = previous_count,
			question = previous_state?.question,
			media = previous_state?.media,
			answers,
			results
		} = mc.AnswersResults;
		return {
			newState: {
				index,
				count,
				Slide: {
					MultipleChoice: 'AnswersResults',
					question,
					media,
					answers,
					results
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

	const { index: previous_index = 0, count: previous_count = 1 } =
		context.currentState && 'Slide' in context.currentState ? context.currentState : {};

	if ('QuestionAnnouncement' in ta) {
		const { index, count, question, media, duration, accept_answers } = ta.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					TypeAnswer: 'QuestionAnnouncement',
					question,
					media,
					accept_answers
				}
			},
			timer: duration,
			initialTimer: duration
		};
	}

	if ('AnswersCount' in ta) {
		return {
			newState: {
				...(context.currentState || { index: previous_index, count: previous_count }),
				Slide: {
					...previous_state,
					TypeAnswer: previous_state?.TypeAnswer ?? 'QuestionAnnouncement'
				}
			}
		};
	}

	if ('AnswersResults' in ta) {
		const {
			index = previous_index,
			count = previous_count,
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
				Slide: {
					TypeAnswer: 'AnswersResults',
					question,
					media,
					answers,
					results,
					case_sensitive
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

	const { index: previous_index = 0, count: previous_count = 1 } =
		context.currentState && 'Slide' in context.currentState ? context.currentState : {};

	if ('QuestionAnnouncement' in order) {
		const { index, count, question, media, duration } = order.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					Order: 'QuestionAnnouncement',
					question,
					media
				}
			},
			timer: duration,
			initialTimer: duration
		};
	}

	if ('AnswersAnnouncement' in order) {
		const {
			index = previous_index,
			count = previous_count,
			question = previous_state?.question,
			media = previous_state?.media,
			answered_count = previous_state?.answered_count,
			duration,
			answers,
			axis_labels
		} = order.AnswersAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					Order: 'AnswersAnnouncement',
					question,
					media,
					answers,
					answered_count,
					axis_labels
				}
			},
			timer: duration,
			initialTimer: duration
		};
	}

	if ('AnswersResults' in order) {
		const {
			index = previous_index,
			count = previous_count,
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
				Slide: {
					Order: 'AnswersResults',
					question,
					media,
					answers,
					results,
					axis_labels
				}
			}
		};
	}

	return {};
}
