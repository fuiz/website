import type {
	AnswerResult,
	TextOrMedia,
	Media,
	IdlessFuizConfig,
	ServerPossiblyHidden
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
				points: [number];
				config: IdlessFuizConfig;
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
				index?: number;
				count?: number;
				score?: {
					points: number;
					position: number;
				};
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
					};
					points: [number];
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
				media?: Media;
				duration: number;
			};
	  }
	| {
			AnswersAnnouncement: {
				index?: number;
				count?: number;
				question?: string;
				media?: Media;
				answers: Array<ServerPossiblyHidden<TextOrMedia>>;
				answered_count?: number;
				duration: number;
			};
	  }
	| {
			AnswersResults: {
				index?: number;
				count?: number;
				question?: string;
				media?: Media;
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
				media?: Media;
				duration: number;
				accept_answers: boolean;
			};
	  }
	| {
			AnswersResults: {
				index?: number;
				count?: number;
				question?: string;
				media?: Media;
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
				media?: Media;
				duration: number;
			};
	  }
	| {
			AnswersAnnouncement: {
				index?: number;
				count?: number;
				question?: string;
				media?: Media;
				answers: Array<string>;
				axis_labels: {
					from?: string;
					to?: string;
				};
				answered_count?: number;
				duration: number;
			};
	  }
	| {
			AnswersResults: {
				index?: number;
				count?: number;
				question?: string;
				media?: Media;
				axis_labels?: {
					from?: string;
					to?: string;
				};
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
