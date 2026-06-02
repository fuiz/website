import type { TruncatedList } from '$lib/question-types/host/types';
import type {
	AnswerMode,
	AnswerResult,
	FuizConfig,
	FuizOptions,
	IdlessFuizConfig,
	Media,
	ServerPossiblyHidden,
	TextOrMedia
} from '$lib/types';

type GameState =
	| {
			WaitingScreen: TruncatedList<string>;
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
			Leaderboard: {
				current: TruncatedList<[string, number]>;
				prior: TruncatedList<[string, number]>;
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
			// Sent only on host state sync: `items` is the full player list,
			// `exact_count` is the current player count. Per-join/leave updates
			// arrive as `PlayerJoined` / `PlayerLeft` events instead.
			WaitingScreen: TruncatedList<string>;
	  }
	| {
			PlayerJoined: string;
	  }
	| {
			PlayerLeft: string;
	  }
	| {
			TeamDisplay: TruncatedList<string>;
	  }
	| {
			Leaderboard: {
				index?: number | null;
				count?: number | null;
				leaderboard: {
					current: TruncatedList<[string, number]>;
					prior: TruncatedList<[string, number]>;
				};
			};
	  }
	| {
			Metainfo: {
				Host: {
					locked: boolean;
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
	  };

/**
 * A slide's own phase, named to match each backend question type's `Phase`
 * enum (serde serializes the variant name). Each question type is free to
 * define its own set, so this is a per-type union rather than a shared one.
 */
type Phase = 'Unstarted' | 'Question' | 'Answers' | 'AnswersResults';

/**
 * A slide's host-facing position, mirroring the backend `SlidePosition`: one
 * variant per question type, each carrying that type's own phase.
 */
type SlidePosition =
	| { MultipleChoice: { index: number; phase: Phase } }
	| { TypeAnswer: { index: number; phase: Phase } }
	| { Order: { index: number; phase: Phase } };

/**
 * Identifies the screen a host "Next" command is issued from. Echoed back to
 * the server (as `{ Host: { Next: <HostScreen> } }`) so a stale duplicate
 * click — sent before the new screen rendered — is ignored instead of
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
