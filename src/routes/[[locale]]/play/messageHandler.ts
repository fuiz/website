import { addIds } from '$lib/clientOnly';
import * as m from '$lib/paraglide/messages.js';
import type {
	BrainstormIncomingMessage,
	FreeTextIncomingMessage,
	GameIncomingMessage,
	InfoSlideIncomingMessage,
	JoinError,
	MultipleChoiceIncomingMessage,
	NameError,
	OrderSlideIncomingMessage,
	PinIncomingMessage,
	PollIncomingMessage,
	ScaleIncomingMessage,
	SliderIncomingMessage,
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

function joinErrorToMessage(joinError: JoinError): string {
	switch (joinError) {
		case 'MaximumPlayers':
			return m.game_full();
		case 'Locked':
			return m.game_locked();
		default:
			return m.cannot_join();
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

	if (game === 'Kicked') {
		return {
			newState: {
				Error: m.you_were_kicked()
			},
			shouldMarkFinished: true,
			shouldCloseSocket: true
		};
	}

	if ('CannotJoin' in game) {
		return {
			newState: {
				Error: joinErrorToMessage(game.CannotJoin)
			},
			shouldMarkFinished: true,
			shouldCloseSocket: true
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

	if ('WaitingCount' in game) {
		// Players are told the size of the lobby, never who is in it.
		return {
			newState: {
				Game: {
					WaitingScreen: {
						player_count: game.WaitingCount
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

	if ('TeammatePicker' in game) {
		return {
			newState: {
				Game: {
					TeammatePicker: {
						...game.TeammatePicker,
						suggestions: []
					}
				}
			}
		};
	}

	if ('TeammateSelected' in game) {
		const current = pickerState(context.currentState);
		if (current === undefined) return {};
		const name = game.TeammateSelected.name;
		const selected = current.selected.includes(name)
			? current.selected
			: [...current.selected, name];
		return {
			newState: {
				Game: {
					TeammatePicker: {
						...current,
						selected,
						suggestions: []
					}
				}
			}
		};
	}

	if ('TeammateSuggestions' in game) {
		const current = pickerState(context.currentState);
		if (current === undefined) return {};
		return {
			newState: {
				Game: {
					TeammatePicker: {
						...current,
						suggestions: game.TeammateSuggestions.suggestions
					}
				}
			}
		};
	}

	if ('TeammateDeselected' in game) {
		const current = pickerState(context.currentState);
		if (current === undefined) return {};
		const name = game.TeammateDeselected.name;
		return {
			newState: {
				Game: {
					TeammatePicker: {
						...current,
						selected: current.selected.filter((n) => n !== name)
					}
				}
			}
		};
	}

	return {};
}

function pickerState(
	state: State | undefined
): { max_selection: number; selected: string[]; suggestions: string[] } | undefined {
	if (state && 'Game' in state && 'TeammatePicker' in state.Game) {
		return state.Game.TeammatePicker;
	}
	return undefined;
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

	if ('SlideAnnouncement' in mc) {
		const { index, count, points_awarded, answer_mode } = mc.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'SlideAnnouncement',
					points_awarded,
					answer_mode
				}
			}
		};
	}

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
					media: media ?? undefined,
					answer_mode: previous_state?.answer_mode
				}
			}
		};
	}

	if ('AnswersAnnouncement' in mc) {
		const { index, count, question, media, answers, answer_mode } = mc.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'AnswersAnnouncement',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answer_mode: answer_mode ?? previous_state?.answer_mode,
					answers: answers.map((a) => {
						if (a === 'Hidden') return undefined;
						return a.Visible;
					})
				}
			}
		};
	}

	if ('AnswersResults' in mc) {
		const { index, count, question, media, answers, results, answer_mode } = mc.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					MultipleChoice: 'AnswersResults',
					question: question ?? previous_state?.question,
					media: media ?? previous_state?.media,
					answer_mode: answer_mode ?? previous_state?.answer_mode,
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

	if ('SlideAnnouncement' in ta) {
		const { index, count, points_awarded } = ta.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					TypeAnswer: 'SlideAnnouncement',
					points_awarded
				}
			}
		};
	}

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

	if ('SlideAnnouncement' in order) {
		const { index, count, points_awarded } = order.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					Order: 'SlideAnnouncement',
					points_awarded
				}
			}
		};
	}

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

	if ('SlideAnnouncement' in slider) {
		const { index, count, points_awarded } = slider.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Slider: 'SlideAnnouncement', points_awarded }
			}
		};
	}

	if ('QuestionAnnouncement' in slider) {
		const { index, count, question, media } = slider.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Slider: 'QuestionAnnouncement', question, media: media ?? undefined }
			}
		};
	}

	if ('AnswersAnnouncement' in slider) {
		const { index, count, question, media, range, unit } = slider.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Slider: 'AnswersAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					range,
					unit: unit ?? undefined
				}
			}
		};
	}

	if ('AnswersResults' in slider) {
		const { index, count, question, media, range, unit, correct, tolerance, results } =
			slider.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Slider: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					range,
					unit: unit ?? undefined,
					correct,
					tolerance,
					results,
					answered: previous?.answered
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

	if ('SlideAnnouncement' in scale) {
		const { index, count, points_awarded, style } = scale.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Scale: 'SlideAnnouncement', points_awarded, style }
			}
		};
	}

	if ('QuestionAnnouncement' in scale) {
		const { index, count, question, media } = scale.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					Scale: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					style: previous?.style
				}
			}
		};
	}

	if ('AnswersAnnouncement' in scale) {
		const { index, count, question, media, points, labels, style } = scale.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Scale: 'AnswersAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					points,
					labels,
					style
				}
			}
		};
	}

	if ('AnswersResults' in scale) {
		const { index, count, question, media, points, labels, style, results } = scale.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Scale: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					points,
					labels,
					style,
					results,
					answered: previous?.answered
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

	if ('SlideAnnouncement' in poll) {
		const { index, count, points_awarded } = poll.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Poll: 'SlideAnnouncement', points_awarded }
			}
		};
	}

	if ('QuestionAnnouncement' in poll) {
		const { index, count, question, media } = poll.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Poll: 'QuestionAnnouncement', question, media: media ?? undefined }
			}
		};
	}

	if ('AnswersAnnouncement' in poll) {
		const { index, count, question, media, answers } = poll.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Poll: 'AnswersAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					answers
				}
			}
		};
	}

	if ('AnswersResults' in poll) {
		const { index, count, question, media, answers, results } = poll.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Poll: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					answers,
					results,
					answered: previous?.answered
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

	if ('SlideAnnouncement' in pin) {
		const { index, count, points_awarded, scored } = pin.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Pin: 'SlideAnnouncement', points_awarded, scored }
			}
		};
	}

	if ('QuestionAnnouncement' in pin) {
		const { index, count, question, media } = pin.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					Pin: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					scored: previous?.scored
				}
			}
		};
	}

	if ('AnswersAnnouncement' in pin) {
		const { index, count, question, media, scored } = pin.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Pin: 'AnswersAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					scored
				}
			}
		};
	}

	if ('AnswersResults' in pin) {
		const { index, count, question, media, correct_area } = pin.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Pin: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					correct_area: correct_area ?? undefined,
					scored: correct_area != null,
					answered: previous?.answered
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

	if ('SlideAnnouncement' in freeText) {
		const { index, count, points_awarded, mode } = freeText.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { FreeText: 'SlideAnnouncement', points_awarded, mode }
			}
		};
	}

	if ('QuestionAnnouncement' in freeText) {
		const { index, count, question, media } = freeText.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: {
					FreeText: 'QuestionAnnouncement',
					question,
					media: media ?? undefined,
					mode: previous?.mode
				}
			}
		};
	}

	if ('AnswersAnnouncement' in freeText) {
		const { index, count, question, media, mode, max_entries, max_entry_length } =
			freeText.AnswersAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					FreeText: 'AnswersAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					mode,
					max_entries,
					max_entry_length
				}
			}
		};
	}

	if ('AnswersResults' in freeText) {
		const { index, count, question, media, mode } = freeText.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					FreeText: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					mode,
					answered: previous?.answered
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

	if ('SlideAnnouncement' in brainstorm) {
		const { index, count, points_awarded } = brainstorm.SlideAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Brainstorm: 'SlideAnnouncement', points_awarded }
			}
		};
	}

	if ('QuestionAnnouncement' in brainstorm) {
		const { index, count, question, media } = brainstorm.QuestionAnnouncement;
		return {
			newState: {
				index,
				count,
				score: context.previousScore,
				Slide: { Brainstorm: 'QuestionAnnouncement', question, media: media ?? undefined }
			}
		};
	}

	if ('IdeasAnnouncement' in brainstorm) {
		const { index, count, question, media, max_ideas, max_idea_length } =
			brainstorm.IdeasAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Brainstorm: 'IdeasAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					max_ideas,
					max_idea_length
				}
			}
		};
	}

	if ('VotingAnnouncement' in brainstorm) {
		const { index, count, question, media, ideas, max_votes } = brainstorm.VotingAnnouncement;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Brainstorm: 'VotingAnnouncement',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					ideas,
					max_votes,
					contributed: previous?.contributed
				}
			}
		};
	}

	if ('AnswersResults' in brainstorm) {
		const { index, count, question, media, results } = brainstorm.AnswersResults;
		return {
			newState: {
				index: index ?? context.previousIndex,
				count: count ?? context.previousCount,
				score: context.previousScore,
				Slide: {
					Brainstorm: 'AnswersResults',
					question: question ?? previous?.question,
					media: media ?? previous?.media,
					ideas: previous?.ideas,
					results,
					contributed: previous?.contributed,
					answered: previous?.answered
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
	context: QuestionMessageContext
): QuestionMessageResult {
	const { index, count, title, body, media } = infoSlide.ContentAnnouncement;
	return {
		newState: {
			index,
			count,
			score: context.previousScore,
			Slide: {
				InfoSlide: 'ContentAnnouncement',
				title,
				body: body ?? undefined,
				media: media ?? undefined
			}
		}
	};
}
