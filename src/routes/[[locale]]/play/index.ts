import type {
	AnswerMode,
	AnswerResult,
	BrainstormResults,
	FreeTextMode,
	FuizConfig,
	IdlessFuizConfig,
	Media,
	PinPoint,
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

type GameState =
	| {
			WaitingScreen: {
				player_count: number;
			};
	  }
	| {
			FindTeam: string;
	  }
	| {
			TeammatePicker: {
				max_selection: number;
				selected: string[];
				suggestions: string[];
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
			MultipleChoice:
				| 'SlideAnnouncement'
				| 'QuestionAnnouncement'
				| 'AnswersAnnouncement'
				| 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: (TextOrMedia | undefined)[];
			results?: AnswerResult[];
			answered?: number | number[];
			answer_mode?: AnswerMode;
			points_awarded?: number;
	  }
	| {
			TypeAnswer: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: string[];
			results?: [string, number][];
			answered?: string;
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
			results?: [number, number];
			axis_labels?: {
				from?: string;
				to?: string;
			};
			answered?: string[];
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
			/** The value this player submitted, once they have. */
			answered?: number;
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
			answered?: number;
			points_awarded?: number;
	  }
	| {
			Poll: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			answers?: TextOrMedia[];
			results?: PollResults;
			answered?: number;
			points_awarded?: number;
	  }
	| {
			Pin: 'SlideAnnouncement' | 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

			question?: string;
			media?: Media;
			scored?: boolean;
			correct_area?: PinShape;
			answered?: PinPoint;
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
			answered?: string[];
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
			ideas?: string[];
			max_ideas?: number;
			max_idea_length?: number;
			max_votes?: number;
			results?: BrainstormResults;
			/** Ideas contributed during the collection phase. */
			contributed?: string[];
			/** Indices voted for during the voting phase. */
			answered?: number[];
			points_awarded?: number;
	  }
	| {
			InfoSlide: 'ContentAnnouncement';

			title?: string;
			body?: string;
			media?: Media;
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

export type JoinError = 'MaximumPlayers' | 'Locked';

export type GameIncomingMessage =
	| { IdAssign: string }
	| { WaitingCount: number }
	| {
			FindTeam: string;
	  }
	| {
			TeammatePicker: {
				max_selection: number;
				selected: string[];
			};
	  }
	| {
			TeammateSelected: {
				name: string;
			};
	  }
	| {
			TeammateSuggestions: {
				suggestions: string[];
			};
	  }
	| {
			TeammateDeselected: {
				name: string;
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
	| 'Kicked'
	| {
			CannotJoin: JoinError;
	  }
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

export type SlideAnnouncementMessage = {
	SlideAnnouncement: {
		index: number;
		count: number;
		points_awarded: number;
		duration?: number | null;
		answer_mode?: AnswerMode;
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
				answers: Array<string>;
				axis_labels: {
					from?: string | null;
					to?: string | null;
				};
				answered_count?: number | null;
				duration?: number | null;
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

export type SliderIncomingMessage =
	| SlideAnnouncementMessage
	| QuestionAnnouncementMessage
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
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
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
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
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
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
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
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
			};
	  };

export type FreeTextIncomingMessage =
	| (SlideAnnouncementMessage & { SlideAnnouncement: { mode?: FreeTextMode } })
	| QuestionAnnouncementMessage
	| {
			AnswersAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
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
			};
	  };

export type BrainstormIncomingMessage =
	| SlideAnnouncementMessage
	| QuestionAnnouncementMessage
	| {
			IdeasAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
				duration?: number | null;
				max_ideas: number;
				max_idea_length: number;
			};
	  }
	| {
			VotingAnnouncement: {
				index?: number | null;
				count?: number | null;
				question?: string | null;
				media?: Media | null;
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
