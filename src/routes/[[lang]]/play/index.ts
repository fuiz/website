import type {
	AnswerResult,
	FuizConfig,
	IdlessFuizConfig,
	Media,
	ServerPossiblyHidden,
	TextOrMedia
} from '$lib/types';

type GameState =
	| {
			WaitingScreen: {
				exact_count: number;
			};
	  }
	| {
			FindTeam: string;
	  }
	| {
			ChooseTeammates: {
				max_selection: number;
				available: [string, boolean][];
			};
	  }
	| {
			NameChoose: {
				sending: boolean;
				error: string;
			};
	  }
	| {
			Summary: {
				score?: {
					points: number;
					position: number;
				};
				points: number[];
				config: FuizConfig;
			};
	  };

type SlideState =
	| {
			MultipleChoice: 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: (TextOrMedia | undefined)[];
			results?: AnswerResult[];
			answered?: number;
	  }
	| {
			TypeAnswer: 'QuestionAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			results?: [string, number][];
			answered?: string;
			accept_answers?: boolean;
			case_sensitive?: boolean;
	  }
	| {
			Order: 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			results?: [number, number];
			axis_labels?: {
				from?: string;
				to?: string;
			};
			answered?: string[];
	  }
	| {
			Score: {
				points: number;
				position: number | undefined;
			};
	  };

export type State =
	| {
			Game: GameState;
	  }
	| {
			index: number;
			count: number;
			score: number;
			Slide: SlideState;
	  }
	| {
			Error: string;
	  };

export type NameError = 'Used' | 'Assigned' | 'Empty' | 'Sinful' | 'TooLong';

export type GameIncomingMessage =
	| { IdAssign: string }
	| {
			WaitingScreen: {
				exact_count: number;
			};
	  }
	| {
			FindTeam: string;
	  }
	| {
			ChooseTeammates: {
				max_selection: number;
				available: [string, boolean][];
			};
	  }
	| {
			Score: {
				index?: number | null;
				count?: number | null;
				score?: {
					points: number;
					position: number;
				} | null;
			};
	  }
	| 'NameChoose'
	| {
			NameAssign: string;
	  }
	| {
			NameError: NameError;
	  }
	| {
			Metainfo: {
				Player: {
					score: number;
					show_answers: boolean;
				};
			};
	  }
	| {
			Summary: {
				Player: {
					score?: {
						points: number;
						position: number;
					} | null;
					points: number[];
					config: IdlessFuizConfig;
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
			AnswersResults: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				answers: string[];
				results: [string, number][];
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
				answers: Array<string>;
				axis_labels: {
					from?: string | null;
					to?: string | null;
				};
				answered_count?: number | null;
				duration: number;
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
				answers: Array<string>;
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
