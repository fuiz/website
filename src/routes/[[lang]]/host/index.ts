import type { TeamRoster } from '$lib/question-types/host/types';
import type {
	AnswerMode,
	AnswerResult,
	BrainstormResults,
	FreeTextMode,
	FreeTextResults,
	FuizConfig,
	FuizOptions,
	IdlessFuizConfig,
	Media,
	PinResults,
	PinShape,
	PollResults,
	ScaleLabels,
	ScaleResults,
	ScaleStyle,
	ServerPossiblyHidden,
	SliderRange,
	SliderResults,
	TextOrMedia
} from '$lib/types';

export type { TeamRoster };

type GameState =
	| {
			WaitingScreen: string[];
	  }
	| {
			Summary: {
				stats: [number, number][];
				player_count: number;
				results: { [k: string]: number[] };
				team_mapping: { [k: string]: string[] };
				config: FuizConfig;
				options: FuizOptions;
			};
	  };

type SlideState =
	| {
			MultipleChoice:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'AnswersAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: (TextOrMedia | undefined)[];
			answered_count?: number;
			results?: AnswerResult[];
			answer_mode?: AnswerMode;
			points_awarded?: number;
	  }
	| {
			TypeAnswer: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			answered_count?: number;
			results?: [string, number][];
			accept_answers?: boolean;
			case_sensitive?: boolean;
			points_awarded?: number;
	  }
	| {
			Order:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'AnswersAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			answered_count?: number;
			results?: [number, number];
			axis_labels?: {
				from?: string;
				to?: string;
			};
			points_awarded?: number;
	  }
	| {
			Slider:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'AnswersAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			range?: SliderRange;
			unit?: string;
			correct?: number;
			tolerance?: number;
			results?: SliderResults;
			answered_count?: number;
			points_awarded?: number;
	  }
	| {
			Scale:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'AnswersAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			points?: number[];
			labels?: ScaleLabels;
			style?: ScaleStyle;
			results?: ScaleResults;
			answered_count?: number;
			points_awarded?: number;
	  }
	| {
			Poll: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: TextOrMedia[];
			results?: PollResults;
			answered_count?: number;
			points_awarded?: number;
	  }
	| {
			Pin: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			scored?: boolean;
			correct_area?: PinShape;
			results?: PinResults;
			answered_count?: number;
			points_awarded?: number;
	  }
	| {
			FreeText:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'AnswersAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			mode?: FreeTextMode;
			max_entries?: number;
			max_entry_length?: number;
			results?: FreeTextResults;
			answered_count?: number;
			points_awarded?: number;
	  }
	| {
			Brainstorm:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'IdeasAnnouncement'
				| 'VotingAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			/** The shared board, in the order ideas arrived. */
			ideas?: string[];
			max_ideas?: number;
			max_idea_length?: number;
			max_votes?: number;
			results?: BrainstormResults;
			answered_count?: number;
			points_awarded?: number;
	  }
	| {
			InfoSlide: 'ContentAnnouncement';

			title?: string;
			body?: string;
			media?: Media;
	  }
	| {
			Leaderboard: {
				current: [string, number][];
				prior: [string, number][];
			};
	  };

export type State =
	| {
			Game: GameState;
	  }
	| {
			index: number;
			count: number;
			Slide: SlideState;
	  }
	| {
			Error: string;
	  };

export type GameIncomingMessage =
	| {
			IdAssign: string;
	  }
	| {
			// Sent only on host state sync, holding every player's name.
			// Per-join/leave updates arrive as `PlayerJoined` / `PlayerLeft`
			// events instead.
			WaitingScreen: string[];
	  }
	| {
			PlayerJoined: string;
	  }
	| {
			PlayerLeft: string;
	  }
	| {
			TeamDisplay: string[];
	  }
	| {
			/** Who answered the current slide, in reply to a `RequestResponses`. */
			PlayerResponses: { name: string; answer: string }[];
	  }
	| {
			/** Who is on each team, in reply to a `RequestTeamRosters`. */
			TeamRosters: TeamRoster[];
	  }
	| {
			Leaderboard: {
				index?: number | null;
				count?: number | null;
				leaderboard: {
					current: [string, number][];
					prior: [string, number][];
				};
			};
	  }
	| {
			Metainfo: {
				Host: {
					locked: boolean;
					/**
					 * Whether this game plays in teams. Carried on every host sync
					 * rather than inferred from `TeamDisplay`, which a host who
					 * reloads mid-slide never receives.
					 */
					teams: boolean;
				};
			};
	  }
	| {
			Summary: {
				Host: {
					stats: [number, number][];
					player_count: number;
					results: [string, number[]][];
					team_mapping: [string, string[]][];
					config: IdlessFuizConfig;
					options: FuizOptions;
				};
			};
	  };

export type SlideAnnouncementMessage = {
	SlideAnnouncement: {
		index: number;
		count: number;
		points_awarded: number;
		duration?: number | null;
	};
};

export type MultipleChoiceIncomingMessage =
	| SlideAnnouncementMessage
	| {
			QuestionAnnouncement: {
				index: number;
				count: number;
				question: string;
				media?: Media | null;
				duration?: number | null;
			};
	  }
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answers: Array<ServerPossiblyHidden<TextOrMedia>>;
				answered_count?: number | null;
				duration?: number | null;
				answer_mode?: AnswerMode;
			};
	  }
	| {
			AnswersCount: number;
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answers: Array<TextOrMedia>;
				results: Array<AnswerResult>;
				answer_mode?: AnswerMode;
			};
	  };

export type TypeAnswerIncomingMessage =
	| SlideAnnouncementMessage
	| {
			QuestionAnnouncement: {
				index: number;
				count: number;
				question: string;
				media?: Media | null;
				duration?: number | null;
				accept_answers: boolean;
			};
	  }
	| {
			AnswersCount: number;
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answers: Array<string>;
				results: Array<[string, number]>;
				case_sensitive: boolean;
			};
	  };

export type OrderSlideIncomingMessage =
	| SlideAnnouncementMessage
	| {
			QuestionAnnouncement: {
				index: number;
				count: number;
				question: string;
				media?: Media | null;
				duration?: number | null;
			};
	  }
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answered_count?: number | null;
				duration?: number | null;
				answers: string[];
				axis_labels: {
					from?: string | null;
					to?: string | null;
				};
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				axis_labels?: {
					from?: string | null;
					to?: string | null;
				} | null;
				answers: string[];
				results: [number, number];
			};
	  };

/** Shared by every slide type that reveals its question before its answers. */
type QuestionAnnouncementMessage = {
	QuestionAnnouncement: {
		index: number;
		count: number;
		question: string;
		media?: Media | null;
		duration?: number | null;
	};
};

/** Shared by every slide type that ticks the host's answered counter. */
type AnswersCountMessage = {
	AnswersCount: number;
};

export type SliderIncomingMessage =
	| SlideAnnouncementMessage
	| QuestionAnnouncementMessage
	| AnswersCountMessage
	| {
			AnswersAnnouncement: {
				duration?: number | null;
				range: SliderRange;
				unit?: string | null;
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				range: SliderRange;
				unit?: string | null;
				correct: number;
				tolerance: number;
				results: SliderResults;
			};
	  };

export type ScaleIncomingMessage =
	| (SlideAnnouncementMessage & { SlideAnnouncement: { style?: ScaleStyle } })
	| QuestionAnnouncementMessage
	| AnswersCountMessage
	| {
			AnswersAnnouncement: {
				duration?: number | null;
				points: number[];
				labels: ScaleLabels;
				style: ScaleStyle;
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				points: number[];
				labels: ScaleLabels;
				style: ScaleStyle;
				results: ScaleResults;
			};
	  };

export type PollIncomingMessage =
	| SlideAnnouncementMessage
	| QuestionAnnouncementMessage
	| AnswersCountMessage
	| {
			AnswersAnnouncement: {
				duration?: number | null;
				answers: TextOrMedia[];
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answers: TextOrMedia[];
				results: PollResults;
			};
	  };

export type PinIncomingMessage =
	| (SlideAnnouncementMessage & { SlideAnnouncement: { scored?: boolean } })
	| QuestionAnnouncementMessage
	| AnswersCountMessage
	| {
			AnswersAnnouncement: {
				duration?: number | null;
				scored: boolean;
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				correct_area?: PinShape | null;
				results: PinResults;
			};
	  };

export type FreeTextIncomingMessage =
	| (SlideAnnouncementMessage & { SlideAnnouncement: { mode?: FreeTextMode } })
	| QuestionAnnouncementMessage
	| AnswersCountMessage
	| {
			AnswersAnnouncement: {
				duration?: number | null;
				mode: FreeTextMode;
				max_entries: number;
				max_entry_length: number;
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				mode: FreeTextMode;
				results: FreeTextResults;
			};
	  };

export type BrainstormIncomingMessage =
	| SlideAnnouncementMessage
	| QuestionAnnouncementMessage
	| AnswersCountMessage
	| {
			IdeasAnnouncement: {
				duration?: number | null;
				max_ideas: number;
				max_idea_length: number;
			};
	  }
	| {
			/** (HOST ONLY) A new idea landed on the board. */
			IdeaAdded: string;
	  }
	| {
			VotingAnnouncement: {
				duration?: number | null;
				ideas: string[];
				max_votes: number;
			};
	  }
	| {
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				results: BrainstormResults;
			};
	  };

export type InfoSlideIncomingMessage = {
	ContentAnnouncement: {
		index: number;
		count: number;
		title: string;
		body?: string | null;
		media?: Media | null;
		duration?: number | null;
	};
};

export type IncomingMessage =
	| {
			Game: GameIncomingMessage;
	  }
	| {
			MultipleChoice: MultipleChoiceIncomingMessage;
	  }
	| {
			TypeAnswer: TypeAnswerIncomingMessage;
	  }
	| {
			Order: OrderSlideIncomingMessage;
	  }
	| {
			Slider: SliderIncomingMessage;
	  }
	| {
			Scale: ScaleIncomingMessage;
	  }
	| {
			Poll: PollIncomingMessage;
	  }
	| {
			Pin: PinIncomingMessage;
	  }
	| {
			FreeText: FreeTextIncomingMessage;
	  }
	| {
			Brainstorm: BrainstormIncomingMessage;
	  }
	| {
			InfoSlide: InfoSlideIncomingMessage;
	  };

/**
 * A slide's own phase, named to match each backend question type's `Phase`
 * enum (serde serializes the variant name). Each question type is free to
 * define its own set, so this is a per-type union rather than a shared one.
 */
type Phase = 'Unstarted' | 'Question' | 'Answers' | 'AnswersResults';

/** Brainstorm splits the answering window into contributing and voting. */
type BrainstormPhase = 'Unstarted' | 'Question' | 'Ideas' | 'Voting' | 'AnswersResults';

/** An info slide is either not up yet or up; there is nothing to answer. */
type InfoSlidePhase = 'Unstarted' | 'Content';

/**
 * A slide's host-facing position, mirroring the backend `SlidePosition`: one
 * variant per question type, each carrying that type's own phase.
 */
type SlidePosition =
	| { MultipleChoice: { index: number; phase: Phase } }
	| { TypeAnswer: { index: number; phase: Phase } }
	| { Order: { index: number; phase: Phase } }
	| { Slider: { index: number; phase: Phase } }
	| { Scale: { index: number; phase: Phase } }
	| { Poll: { index: number; phase: Phase } }
	| { Pin: { index: number; phase: Phase } }
	| { FreeText: { index: number; phase: Phase } }
	| { Brainstorm: { index: number; phase: BrainstormPhase } }
	| { InfoSlide: { index: number; phase: InfoSlidePhase } };

/**
 * Identifies the screen a host "Next" command is issued from. Echoed back to
 * the server (as `{ Host: { Next: <HostScreen> } }`) so a stale duplicate
 * click, sent before the new screen rendered, is ignored instead of
 * advancing the slide twice.
 */
export type HostScreen =
	| 'Lobby'
	| 'Summary'
	| { Slide: SlidePosition }
	| { Leaderboard: { index: number } };

/** Maps a rendered slide message kind to the backend phase it corresponds to. */
function phaseFromKind(
	kind: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults'
): Phase {
	if (kind === 'SlideAnnouncement') return 'Unstarted';
	if (kind === 'AnswersResults') return 'AnswersResults';
	if (kind === 'AnswersAnnouncement') return 'Answers';
	return 'Question';
}

/** Every slide kind whose value names the phase that slide is showing. */
const ANSWERABLE_SLIDE_KINDS = [
	'MultipleChoice',
	'TypeAnswer',
	'Order',
	'Slider',
	'Scale',
	'Poll',
	'Pin',
	'FreeText',
	'Brainstorm'
] as const;

/**
 * The slide index while the room is on a slide's results screen, `undefined`
 * everywhere else.
 *
 * This is the one moment worth asking who answered what: every submission is in
 * and the slide's state is still live, so the server can still join names to
 * answers. Info slides never qualify, since they ask nothing.
 */
export function resultsSlideIndex(state: State | undefined): number | undefined {
	if (state === undefined || 'Error' in state || 'Game' in state) return undefined;
	const slide: Record<string, unknown> = state.Slide;
	return ANSWERABLE_SLIDE_KINDS.some((kind) => slide[kind] === 'AnswersResults')
		? state.index
		: undefined;
}

/**
 * Derives the [`HostScreen`] the host is currently looking at, or `undefined`
 * for screens with no "Next" action (e.g. an error page).
 */
export function hostScreenFromState(state: State | undefined): HostScreen | undefined {
	if (state === undefined || 'Error' in state) return undefined;

	if ('Game' in state) {
		if ('WaitingScreen' in state.Game) return 'Lobby';
		if ('Summary' in state.Game) return 'Summary';
		return undefined;
	}

	const { index, Slide } = state;
	if ('Leaderboard' in Slide) return { Leaderboard: { index } };

	if ('MultipleChoice' in Slide) {
		return { Slide: { MultipleChoice: { index, phase: phaseFromKind(Slide.MultipleChoice) } } };
	}
	if ('Order' in Slide) {
		return { Slide: { Order: { index, phase: phaseFromKind(Slide.Order) } } };
	}
	if ('Slider' in Slide) {
		return { Slide: { Slider: { index, phase: phaseFromKind(Slide.Slider) } } };
	}
	if ('Scale' in Slide) {
		return { Slide: { Scale: { index, phase: phaseFromKind(Slide.Scale) } } };
	}
	if ('Poll' in Slide) {
		return { Slide: { Poll: { index, phase: phaseFromKind(Slide.Poll) } } };
	}
	if ('Pin' in Slide) {
		return { Slide: { Pin: { index, phase: phaseFromKind(Slide.Pin) } } };
	}
	if ('FreeText' in Slide) {
		return { Slide: { FreeText: { index, phase: phaseFromKind(Slide.FreeText) } } };
	}
	if ('Brainstorm' in Slide) {
		const kind = Slide.Brainstorm;
		const phase: BrainstormPhase =
			kind === 'SlideAnnouncement'
				? 'Unstarted'
				: kind === 'QuestionAnnouncement'
					? 'Question'
					: kind === 'IdeasAnnouncement'
						? 'Ideas'
						: kind === 'VotingAnnouncement'
							? 'Voting'
							: 'AnswersResults';
		return { Slide: { Brainstorm: { index, phase } } };
	}
	if ('InfoSlide' in Slide) {
		return { Slide: { InfoSlide: { index, phase: 'Content' } } };
	}
	// TypeAnswer renders `QuestionAnnouncement` for both the Question and
	// Answers phases; `accept_answers` distinguishes them.
	let phase: Phase;
	if (Slide.TypeAnswer === 'SlideAnnouncement') {
		phase = 'Unstarted';
	} else if (Slide.TypeAnswer === 'AnswersResults') {
		phase = 'AnswersResults';
	} else {
		phase = Slide.accept_answers ? 'Answers' : 'Question';
	}
	return { Slide: { TypeAnswer: { index, phase } } };
}
