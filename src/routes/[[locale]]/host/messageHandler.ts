import { addIds } from '$lib/clientOnly';
import type {
	BrainstormIncomingMessage,
	FreeTextIncomingMessage,
	GameIncomingMessage,
	InfoSlideIncomingMessage,
	MultipleChoiceIncomingMessage,
	OrderSlideIncomingMessage,
	PinIncomingMessage,
	PollIncomingMessage,
	ScaleIncomingMessage,
	SliderIncomingMessage,
	State,
	TeamRoster,
	TypeAnswerIncomingMessage
} from './index';

/** The lobby roster held in state, or an empty one before the first sync. */
function rosterOf(state: State | undefined): string[] {
	return state && 'Game' in state && 'WaitingScreen' in state.Game ? state.Game.WaitingScreen : [];
}

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
	/** Who answered the current slide, once the host has asked. */
	newPlayerResponses?: { name: string; answer: string }[];
	/** Who is on each team, once the host has asked. */
	newTeamRosters?: TeamRoster[];
	/** Whether this game plays in teams. */
	newTeamMode?: boolean;
	/** Set once the team display arrives, i.e. teams now exist. */
	teamsFormed?: boolean;
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
	timer?: number | null;
	initialTimer?: number | null;
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

	if ('PlayerJoined' in game) {
		// Append to the host-side roster. Falls back to a fresh single-item list
		// if the event arrived before the initial WaitingScreen sync.
		const previous = rosterOf(context.currentState);
		return {
			newState: {
				Game: {
					WaitingScreen: [...previous, game.PlayerJoined]
				}
			}
		};
	}

	if ('PlayerLeft' in game) {
		// Dropping the name is the whole update: the lobby count is the roster's
		// length, so an unknown name cannot leave the two disagreeing.
		const previous = rosterOf(context.currentState);
		const idx = previous.indexOf(game.PlayerLeft);
		return {
			newState: {
				Game: {
					WaitingScreen:
						idx >= 0 ? [...previous.slice(0, idx), ...previous.slice(idx + 1)] : previous
				}
			}
		};
	}

	if ('PlayerResponses' in game) {
		return { newPlayerResponses: game.PlayerResponses };
	}

	if ('TeamRosters' in game) {
		return { newTeamRosters: game.TeamRosters };
	}

	if ('TeamDisplay' in game) {
		// The team screen reuses the lobby, listing teams where it lists players.
		return {
			teamsFormed: true,
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
			newLockStatus: game.Metainfo.Host.locked,
			newTeamMode: game.Metainfo.Host.teams
		};
	}

	if ('Summary' in game) {
		return {
			newState: {
				Game: {
					Summary: {
						...game.Summary.Host,
						config: addIds(game.Summary.Host.config),
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

	if ('SlideAnnouncement' in mc) {
		const { index, count, points_awarded, duration } = mc.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					MultipleChoice: 'SlideAnnouncement',
					points_awarded
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in mc) {
		const { index, count, question, media, duration } = mc.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					MultipleChoice: 'QuestionAnnouncement',
					question,
					media: media ?? undefined
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in mc) {
		const { index, count, question, media, duration, answers, answered_count, answer_mode } =
			mc.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? previous_index,
				count: count ?? previous_count,
				Slide: {
					MultipleChoice: 'AnswersAnnouncement',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answer_mode: answer_mode ?? previous_state?.answer_mode,
					answers: answers.map((a) => {
						if (a === 'Hidden') return undefined;
						return a.Visible;
					}),
					answered_count: answered_count ?? undefined
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
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
		const { index, count, question, media, answers, results, answer_mode } = mc.AnswersResults;
		return {
			newState: {
				index: index ?? previous_index,
				count: count ?? previous_count,
				Slide: {
					MultipleChoice: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answer_mode: answer_mode ?? previous_state?.answer_mode,
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

	if ('SlideAnnouncement' in ta) {
		const { index, count, points_awarded, duration } = ta.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					TypeAnswer: 'SlideAnnouncement',
					points_awarded
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in ta) {
		const { index, count, question, media, duration, accept_answers } = ta.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					TypeAnswer: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					accept_answers
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
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
		const { index, count, question, media, answers, results, case_sensitive } = ta.AnswersResults;
		return {
			newState: {
				index: index ?? previous_index,
				count: count ?? previous_count,
				Slide: {
					TypeAnswer: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
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

	if ('SlideAnnouncement' in order) {
		const { index, count, points_awarded, duration } = order.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					Order: 'SlideAnnouncement',
					points_awarded
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in order) {
		const { index, count, question, media, duration } = order.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					Order: 'QuestionAnnouncement',
					question,
					media: media ?? undefined
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in order) {
		const { index, count, question, media, answered_count, duration, answers, axis_labels } =
			order.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? previous_index,
				count: count ?? previous_count,
				Slide: {
					Order: 'AnswersAnnouncement',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers,
					answered_count: answered_count ?? previous_state?.answered_count,
					axis_labels: {
						from: axis_labels.from ?? undefined,
						to: axis_labels.to ?? undefined
					}
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersResults' in order) {
		const { index, count, question, media, axis_labels, answers, results } = order.AnswersResults;
		return {
			newState: {
				index: index ?? previous_index,
				count: count ?? previous_count,
				Slide: {
					Order: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answers,
					results,
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

/**
 * The slide index and total the room is on, so a message that omits them (most
 * mid-slide updates do) can keep the header steady.
 */
function surroundings(context: QuestionMessageContext): { index: number; count: number } {
	const state = context.currentState;
	if (state && 'Slide' in state) return { index: state.index, count: state.count };
	return { index: 0, count: 1 };
}

/**
 * Handles incoming Slider messages
 */
export function handleSliderMessage(
	slider: SliderIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous =
		context.currentState &&
		'Slide' in context.currentState &&
		'Slider' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;
	const { index: previousIndex, count: previousCount } = surroundings(context);

	if ('SlideAnnouncement' in slider) {
		const { index, count, points_awarded, duration } = slider.SlideAnnouncement;
		return {
			newState: { index, count, Slide: { Slider: 'SlideAnnouncement', points_awarded } },
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in slider) {
		const { index, count, question, media, duration } = slider.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: { Slider: 'QuestionAnnouncement', question, media: media ?? undefined }
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in slider) {
		const { duration, range, unit } = slider.AnswersAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					Slider: 'AnswersAnnouncement',
					question: previous?.question,
					media: previous?.media,
					range,
					unit: unit ?? undefined,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersCount' in slider) {
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					Slider: previous?.Slider ?? 'AnswersAnnouncement',
					answered_count: slider.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in slider) {
		const { index, count, question, media, range, unit, correct, tolerance, results } =
			slider.AnswersResults;
		return {
			newState: {
				index: index ?? previousIndex,
				count: count ?? previousCount,
				Slide: {
					Slider: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					range,
					unit: unit ?? undefined,
					correct,
					tolerance,
					results
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming Scale messages (both agreement scales and NPS)
 */
export function handleScaleMessage(
	scale: ScaleIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous =
		context.currentState && 'Slide' in context.currentState && 'Scale' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;
	const { index: previousIndex, count: previousCount } = surroundings(context);

	if ('SlideAnnouncement' in scale) {
		const { index, count, points_awarded, duration, style } = scale.SlideAnnouncement;
		return {
			newState: { index, count, Slide: { Scale: 'SlideAnnouncement', points_awarded, style } },
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in scale) {
		const { index, count, question, media, duration } = scale.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					Scale: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					style: previous?.style
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in scale) {
		const { duration, points, labels, style } = scale.AnswersAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					Scale: 'AnswersAnnouncement',
					question: previous?.question,
					media: previous?.media,
					points,
					labels,
					style,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersCount' in scale) {
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					Scale: previous?.Scale ?? 'AnswersAnnouncement',
					answered_count: scale.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in scale) {
		const { index, count, question, media, points, labels, style, results } = scale.AnswersResults;
		return {
			newState: {
				index: index ?? previousIndex,
				count: count ?? previousCount,
				Slide: {
					Scale: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					points,
					labels,
					style,
					results
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming Poll messages
 */
export function handlePollMessage(
	poll: PollIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous =
		context.currentState && 'Slide' in context.currentState && 'Poll' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;
	const { index: previousIndex, count: previousCount } = surroundings(context);

	if ('SlideAnnouncement' in poll) {
		const { index, count, points_awarded, duration } = poll.SlideAnnouncement;
		return {
			newState: { index, count, Slide: { Poll: 'SlideAnnouncement', points_awarded } },
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in poll) {
		const { index, count, question, media, duration } = poll.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: { Poll: 'QuestionAnnouncement', question, media: media ?? undefined }
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in poll) {
		const { duration, answers } = poll.AnswersAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					Poll: 'AnswersAnnouncement',
					question: previous?.question,
					media: previous?.media,
					answers,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersCount' in poll) {
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					Poll: previous?.Poll ?? 'AnswersAnnouncement',
					answered_count: poll.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in poll) {
		const { index, count, question, media, answers, results } = poll.AnswersResults;
		return {
			newState: {
				index: index ?? previousIndex,
				count: count ?? previousCount,
				Slide: {
					Poll: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					answers,
					results
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming Pin messages (both pin answer and drop pin)
 */
export function handlePinMessage(
	pin: PinIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous =
		context.currentState && 'Slide' in context.currentState && 'Pin' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;
	const { index: previousIndex, count: previousCount } = surroundings(context);

	if ('SlideAnnouncement' in pin) {
		const { index, count, points_awarded, duration, scored } = pin.SlideAnnouncement;
		return {
			newState: { index, count, Slide: { Pin: 'SlideAnnouncement', points_awarded, scored } },
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in pin) {
		const { index, count, question, media, duration } = pin.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					Pin: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					scored: previous?.scored
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in pin) {
		const { duration, scored } = pin.AnswersAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					Pin: 'AnswersAnnouncement',
					question: previous?.question,
					media: previous?.media,
					scored,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersCount' in pin) {
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					Pin: previous?.Pin ?? 'AnswersAnnouncement',
					answered_count: pin.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in pin) {
		const { index, count, question, media, correct_area, results } = pin.AnswersResults;
		return {
			newState: {
				index: index ?? previousIndex,
				count: count ?? previousCount,
				Slide: {
					Pin: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					correct_area: correct_area ?? undefined,
					scored: correct_area != null,
					results
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming FreeText messages (both word cloud and open ended)
 */
export function handleFreeTextMessage(
	freeText: FreeTextIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous =
		context.currentState &&
		'Slide' in context.currentState &&
		'FreeText' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;
	const { index: previousIndex, count: previousCount } = surroundings(context);

	if ('SlideAnnouncement' in freeText) {
		const { index, count, points_awarded, duration, mode } = freeText.SlideAnnouncement;
		return {
			newState: { index, count, Slide: { FreeText: 'SlideAnnouncement', points_awarded, mode } },
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in freeText) {
		const { index, count, question, media, duration } = freeText.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: {
					FreeText: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					mode: previous?.mode
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersAnnouncement' in freeText) {
		const { duration, mode, max_entries, max_entry_length } = freeText.AnswersAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					FreeText: 'AnswersAnnouncement',
					question: previous?.question,
					media: previous?.media,
					mode,
					max_entries,
					max_entry_length,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersCount' in freeText) {
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					FreeText: previous?.FreeText ?? 'AnswersAnnouncement',
					answered_count: freeText.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in freeText) {
		const { index, count, question, media, mode, results } = freeText.AnswersResults;
		return {
			newState: {
				index: index ?? previousIndex,
				count: count ?? previousCount,
				Slide: {
					FreeText: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					mode,
					results
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming Brainstorm messages
 */
export function handleBrainstormMessage(
	brainstorm: BrainstormIncomingMessage,
	context: QuestionMessageContext
): QuestionMessageResult {
	const previous =
		context.currentState &&
		'Slide' in context.currentState &&
		'Brainstorm' in context.currentState.Slide
			? context.currentState.Slide
			: undefined;
	const { index: previousIndex, count: previousCount } = surroundings(context);

	if ('SlideAnnouncement' in brainstorm) {
		const { index, count, points_awarded, duration } = brainstorm.SlideAnnouncement;
		return {
			newState: { index, count, Slide: { Brainstorm: 'SlideAnnouncement', points_awarded } },
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('QuestionAnnouncement' in brainstorm) {
		const { index, count, question, media, duration } = brainstorm.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				Slide: { Brainstorm: 'QuestionAnnouncement', question, media: media ?? undefined }
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('IdeasAnnouncement' in brainstorm) {
		const { duration, max_ideas, max_idea_length } = brainstorm.IdeasAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					Brainstorm: 'IdeasAnnouncement',
					question: previous?.question,
					media: previous?.media,
					ideas: [],
					max_ideas,
					max_idea_length,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('IdeaAdded' in brainstorm) {
		// Ideas stream in one at a time so the host's board fills up live.
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					Brainstorm: previous?.Brainstorm ?? 'IdeasAnnouncement',
					ideas: [...(previous?.ideas ?? []), brainstorm.IdeaAdded]
				}
			}
		};
	}

	if ('VotingAnnouncement' in brainstorm) {
		const { duration, ideas, max_votes } = brainstorm.VotingAnnouncement;
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					Brainstorm: 'VotingAnnouncement',
					question: previous?.question,
					media: previous?.media,
					ideas,
					max_votes,
					answered_count: 0
				}
			},
			timer: duration ?? null,
			initialTimer: duration ?? null
		};
	}

	if ('AnswersCount' in brainstorm) {
		return {
			newState: {
				index: previousIndex,
				count: previousCount,
				Slide: {
					...previous,
					Brainstorm: previous?.Brainstorm ?? 'IdeasAnnouncement',
					answered_count: brainstorm.AnswersCount
				}
			}
		};
	}

	if ('AnswersResults' in brainstorm) {
		const { index, count, question, media, results } = brainstorm.AnswersResults;
		return {
			newState: {
				index: index ?? previousIndex,
				count: count ?? previousCount,
				Slide: {
					Brainstorm: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					ideas: previous?.ideas,
					results
				}
			}
		};
	}

	return {};
}

/**
 * Handles incoming InfoSlide messages
 */
export function handleInfoSlideMessage(
	infoSlide: InfoSlideIncomingMessage,
	_context: QuestionMessageContext
): QuestionMessageResult {
	const { index, count, title, body, media, duration } = infoSlide.ContentAnnouncement;
	return {
		newState: {
			index,
			count,
			Slide: {
				InfoSlide: 'ContentAnnouncement',
				title,
				body: body ?? undefined,
				media: media ?? undefined
			}
		},
		timer: duration ?? null,
		initialTimer: duration ?? null
	};
}
