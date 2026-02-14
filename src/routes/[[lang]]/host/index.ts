import type {
	AnswerResult,
	FuizConfig,
	FuizOptions,
	IdlessFuizConfig,
	Media,
	ServerPossiblyHidden,
	TextOrMedia
} from '$lib/types';
import type { TruncatedList } from './+page';

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
			MultipleChoice: 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: (TextOrMedia | undefined)[];
			answered_count?: number;
			results?: AnswerResult[];
	  }
	| {
			TypeAnswer: 'QuestionAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			answered_count?: number;
			results?: [string, number][];
			accept_answers?: boolean;
			case_sensitive?: boolean;
	  }
	| {
			Order: 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			answered_count?: number;
			results?: [number, number];
			axis_labels?: {
				from?: string;
				to?: string;
			};
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
			WaitingScreen: TruncatedList<string>;
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

export type MultipleChoiceIncomingMessage =
	| {
			QuestionAnnouncement: {
				index: number;
				count: number;
				question: string;
				media?: Media | null;
				duration: number;
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
				duration: number;
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
			};
	  };

export type TypeAnswerIncomingMessage =
	| {
			QuestionAnnouncement: {
				index: number;
				count: number;
				question: string;
				media?: Media | null;
				duration: number;
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
	| {
			QuestionAnnouncement: {
				index: number;
				count: number;
				question: string;
				media?: Media | null;
				duration: number;
			};
	  }
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answered_count?: number | null;
				duration: number;
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
