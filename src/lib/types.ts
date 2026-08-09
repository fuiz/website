export type Base64Media = {
	Image: {
		Base64: {
			data: string;
			hash?: string;
			alt: string;
		};
	};
};

export type CorkboardMedia = {
	Image: {
		Corkboard: {
			id: string;
			alt: string;
		};
	};
};

export type UrlMedia = {
	Image: {
		Url: {
			url: string;
			alt: string;
		};
	};
};

export type Media = Base64Media | CorkboardMedia | UrlMedia;

export type TextOrMedia = {
	Text: string;
};

export type AnswerResult = {
	correct: boolean;
	count: number;
};

export type AnswerMode = 'SingleAnswer' | 'MultipleAnswers';

export const DEFAULT_ANSWER_MODE: AnswerMode = 'SingleAnswer';

export type IdlessMultipleChoiceAnswer = {
	correct: boolean;
	content: TextOrMedia;
};

export type MultipleChoiceAnswer = IdlessMultipleChoiceAnswer & {
	id: number;
};

export type GenericIdlessMultipleChoiceSlide<T> = {
	title: string;
	media?: T;
	introduce_question?: number | null;
	time_limit?: number | null;
	points_awarded: number;
	answer_mode?: AnswerMode;

	answers: IdlessMultipleChoiceAnswer[];
};

export type IdlessMultipleChoiceSlide = GenericIdlessMultipleChoiceSlide<Media | undefined>;

export type GenericIdlessTypeAnswer<T> = {
	title: string;
	media?: T;
	introduce_question?: number | null;
	time_limit?: number | null;
	points_awarded: number;
	answers: string[];
	case_sensitive: boolean;
};

export type IdlessTypeAnswer = GenericIdlessTypeAnswer<Media | undefined>;

export type GenericIdlessOrderSlide<T> = {
	title: string;
	media?: T;
	introduce_question?: number | null;
	time_limit?: number | null;
	points_awarded: number;
	axis_labels: {
		from?: string;
		to?: string;
	};
	answers: string[];
};

export type IdlessOrderSlide = GenericIdlessOrderSlide<Media | undefined>;

export type GenericOrderSlide<T> = Modify<
	GenericIdlessOrderSlide<T>,
	{
		answers: {
			text: string;
			id: number;
		}[];
	}
>;

export type OrderSlide = GenericOrderSlide<Media | undefined>;

export type GenericMultipleChoiceSlide<T> = Modify<
	GenericIdlessMultipleChoiceSlide<T>,
	{
		answers: MultipleChoiceAnswer[];
	}
>;

export type MultipleChoiceSlide = GenericMultipleChoiceSlide<Media | undefined>;

export type GenericTypeAnswer<T> = Modify<
	GenericIdlessTypeAnswer<T>,
	{
		answers: {
			text: string;
			id: number;
		}[];
	}
>;

export type TypeAnswer = GenericTypeAnswer<Media | undefined>;

/** Fields every question-style slide carries, whatever it asks for. */
type QuestionBase<T> = {
	title: string;
	media?: T;
	introduce_question?: number | null;
	time_limit?: number | null;
	points_awarded: number;
};

/** The span a slider covers and the granularity players move it in. */
export type SliderRange = {
	min: number;
	max: number;
	step: number;
};

export type GenericIdlessSliderSlide<T> = QuestionBase<T> & {
	range: SliderRange;
	/** The value that earns points. */
	correct: number;
	/** How far from `correct` still counts as correct; `0` demands an exact hit. */
	tolerance: number;
	/** Shown next to the value, e.g. `%`, `kg`, `deg C`. */
	unit?: string | null;
};

export type IdlessSliderSlide = GenericIdlessSliderSlide<Media | undefined>;
export type GenericSliderSlide<T> = GenericIdlessSliderSlide<T>;
export type SliderSlide = GenericSliderSlide<Media | undefined>;

/** `Agreement` is a short opinion scale; `Nps` is the 0-10 Net Promoter Score. */
export type ScaleStyle = 'Agreement' | 'Nps';

export type ScaleLabels = {
	low?: string | null;
	mid?: string | null;
	high?: string | null;
};

export type GenericIdlessScaleSlide<T> = QuestionBase<T> & {
	min: number;
	max: number;
	style: ScaleStyle;
	labels: ScaleLabels;
};

export type IdlessScaleSlide = GenericIdlessScaleSlide<Media | undefined>;
export type GenericScaleSlide<T> = GenericIdlessScaleSlide<T>;
export type ScaleSlide = GenericScaleSlide<Media | undefined>;

export type IdlessPollAnswer = {
	content: TextOrMedia;
};

export type PollAnswer = IdlessPollAnswer & {
	id: number;
};

export type GenericIdlessPollSlide<T> = QuestionBase<T> & {
	answers: IdlessPollAnswer[];
};

export type IdlessPollSlide = GenericIdlessPollSlide<Media | undefined>;

export type GenericPollSlide<T> = Modify<
	GenericIdlessPollSlide<T>,
	{
		answers: PollAnswer[];
	}
>;

export type PollSlide = GenericPollSlide<Media | undefined>;

/** A point on the slide's image, normalised to `0..1` on both axes. */
export type PinPoint = {
	x: number;
	y: number;
};

/**
 * The region that earns points on a pin-answer slide.
 *
 * Every coordinate is normalised to `0..1` of the image. Widths and heights are
 * carried independently, so there is no aspect ratio to reconcile: a circle
 * drawn over a wide photo stays a circle when it is drawn again.
 */
export type PinShape =
	| {
			/** An axis-aligned box, anchored at its top-left corner. */
			Rectangle: { x: number; y: number; width: number; height: number };
	  }
	| {
			/** An axis-aligned ellipse. */
			Ellipse: { center: PinPoint; radius_x: number; radius_y: number };
	  }
	| {
			/** A freehand outline, implicitly closed from the last point to the first. */
			Polygon: { points: PinPoint[] };
	  };

/** The tools the correct-area editor offers, matching the shapes above. */
export const pinTools = ['Rectangle', 'Ellipse', 'Polygon'] as const;

export type PinTool = (typeof pinTools)[number];

export type GenericIdlessPinSlide<T> = QuestionBase<T> & {
	/** `null` turns this into a drop pin: every placement is equally valid. */
	correct_area?: PinShape | null;
};

export type IdlessPinSlide = GenericIdlessPinSlide<Media | undefined>;
export type GenericPinSlide<T> = GenericIdlessPinSlide<T>;
export type PinSlide = GenericPinSlide<Media | undefined>;

/** `WordCloud` piles short entries together; `OpenEnded` lists responses. */
export type FreeTextMode = 'WordCloud' | 'OpenEnded';

export type GenericIdlessFreeTextSlide<T> = QuestionBase<T> & {
	mode: FreeTextMode;
	max_entries: number;
	max_entry_length: number;
};

export type IdlessFreeTextSlide = GenericIdlessFreeTextSlide<Media | undefined>;
export type GenericFreeTextSlide<T> = GenericIdlessFreeTextSlide<T>;
export type FreeTextSlide = GenericFreeTextSlide<Media | undefined>;

export type GenericIdlessBrainstormSlide<T> = {
	title: string;
	media?: T;
	introduce_question?: number | null;
	/** Time players have to contribute ideas. */
	idea_time_limit?: number | null;
	/** Time players have to vote on the collected board. */
	vote_time_limit?: number | null;
	points_awarded: number;
	max_ideas_per_player: number;
	max_votes_per_player: number;
	max_idea_length: number;
};

export type IdlessBrainstormSlide = GenericIdlessBrainstormSlide<Media | undefined>;
export type GenericBrainstormSlide<T> = GenericIdlessBrainstormSlide<T>;
export type BrainstormSlide = GenericBrainstormSlide<Media | undefined>;

export type GenericIdlessInfoSlide<T> = {
	title: string;
	body?: string | null;
	media?: T;
	/** How long the slide stays up; `null` waits for the host. */
	duration?: number | null;
};

export type IdlessInfoSlide = GenericIdlessInfoSlide<Media | undefined>;
export type GenericInfoSlide<T> = GenericIdlessInfoSlide<T>;
export type InfoSlide = GenericInfoSlide<Media | undefined>;

// --- Result payloads, mirroring the backend's per-slide `Results` structs. ---

export type SliderValueCount = {
	value: number;
	count: number;
};

export type SliderResults = {
	/** One entry per distinct submitted value, ascending. */
	distribution: SliderValueCount[];
	average: number | null;
	correct_count: number;
	total_count: number;
};

export type NpsBreakdown = {
	promoters: number;
	passives: number;
	detractors: number;
	/** `%promoters - %detractors`, in the conventional -100..100 range. */
	score: number;
};

export type ScaleResults = {
	/** One count per selectable point, aligned with the scale. */
	counts: number[];
	average: number | null;
	total_count: number;
	nps: NpsBreakdown | null;
};

export type PollResults = {
	/** One count per option, aligned with the configured order. */
	counts: number[];
	total_count: number;
};

export type PinResults = {
	pins: PinPoint[];
	/** `null` on drop pins, which have nothing to be right about. */
	correct_count: number | null;
	total_count: number;
};

export type FreeTextEntry = {
	text: string;
	count: number;
};

export type FreeTextResults = {
	/** Distinct entries, most frequent first. */
	entries: FreeTextEntry[];
	total_entries: number;
	total_count: number;
};

export type BrainstormIdea = {
	text: string;
	votes: number;
};

export type BrainstormResults = {
	/** The board ranked by votes, ties broken by the order ideas arrived. */
	ideas: BrainstormIdea[];
	voter_count: number;
	contributor_count: number;
};

export function getTitle<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): string {
	return getBody(slide).title;
}

export function getMedia<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): T | undefined {
	return getBody(slide).media;
}

/**
 * The most a slide can award. Info slides ask nothing and free-text slides
 * collect opinions, so both sit at `0`, which is how a report tells a question
 * worth no points apart from one everybody got wrong.
 */
export function getPointsAwarded<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): number {
	return getBody(slide).points_awarded ?? 0;
}

async function mapIdlessMedia<T, O>(
	slide: GenericIdlessSlide<T | undefined>,
	map: (media: T | undefined) => Promise<O>
): Promise<GenericIdlessSlide<O>> {
	const kind = getQuestionType(slide);
	const body = getBody(slide);
	return { [kind]: { ...body, media: await map(body.media) } } as GenericIdlessSlide<O>;
}

export async function mapIdlessSlidesMedia<T, O>(
	config: GenericIdlessFuizConfig<T | undefined>,
	map: (media: T | undefined) => Promise<O>
): Promise<GenericIdlessFuizConfig<O>> {
	return {
		...config,
		slides: await Promise.all(
			config.slides.map(async (slide, index) => {
				try {
					return await mapIdlessMedia(slide, map);
				} catch (error) {
					if (error instanceof Error) {
						(error as any).slideContext = slide;
						(error as any).slideIndex = index;
					}
					throw error;
				}
			})
		)
	};
}

function mapIdlessMediaSync<T, O>(
	slide: GenericIdlessSlide<T | undefined>,
	map: (media: T | undefined) => O
): GenericIdlessSlide<O> {
	const kind = getQuestionType(slide);
	const body = getBody(slide);
	return { [kind]: { ...body, media: map(body.media) } } as GenericIdlessSlide<O>;
}

export function mapIdlessSlidesMediaSync<T, O>(
	config: GenericIdlessFuizConfig<T | undefined>,
	map: (media: T | undefined) => O
): GenericIdlessFuizConfig<O> {
	return {
		...config,
		slides: config.slides.map((slide) => mapIdlessMediaSync(slide, map))
	};
}

export type GenericIdlessSlide<T> =
	| {
			MultipleChoice: GenericIdlessMultipleChoiceSlide<T>;
	  }
	| {
			TypeAnswer: GenericIdlessTypeAnswer<T>;
	  }
	| {
			Order: GenericIdlessOrderSlide<T>;
	  }
	| {
			Slider: GenericIdlessSliderSlide<T>;
	  }
	| {
			Scale: GenericIdlessScaleSlide<T>;
	  }
	| {
			Poll: GenericIdlessPollSlide<T>;
	  }
	| {
			Pin: GenericIdlessPinSlide<T>;
	  }
	| {
			FreeText: GenericIdlessFreeTextSlide<T>;
	  }
	| {
			Brainstorm: GenericIdlessBrainstormSlide<T>;
	  }
	| {
			InfoSlide: GenericIdlessInfoSlide<T>;
	  };

export type IdlessSlide = GenericIdlessSlide<Media | undefined>;

export type GenericSlide<T> =
	| {
			MultipleChoice: GenericMultipleChoiceSlide<T>;
			id: number;
	  }
	| {
			TypeAnswer: GenericTypeAnswer<T>;
			id: number;
	  }
	| {
			Order: GenericOrderSlide<T>;
			id: number;
	  }
	| {
			Slider: GenericSliderSlide<T>;
			id: number;
	  }
	| {
			Scale: GenericScaleSlide<T>;
			id: number;
	  }
	| {
			Poll: GenericPollSlide<T>;
			id: number;
	  }
	| {
			Pin: GenericPinSlide<T>;
			id: number;
	  }
	| {
			FreeText: GenericFreeTextSlide<T>;
			id: number;
	  }
	| {
			Brainstorm: GenericBrainstormSlide<T>;
			id: number;
	  }
	| {
			InfoSlide: GenericInfoSlide<T>;
			id: number;
	  };

export type Slide = GenericSlide<Media | undefined>;

// Every slide kind, derived from the slide union so this stays in sync with the
// Slide definition (distributes over the union to grab each key).
type SlideKind<S> = S extends S ? keyof S : never;
export type QuestionType = Exclude<SlideKind<GenericSlide<unknown>>, 'id'>;

/**
 * Every slide kind, in the order the add-slide picker offers them. Iterating
 * this is what lets the helpers below stay one branch long instead of growing a
 * new `if` per question type.
 */
export const questionTypes = [
	'MultipleChoice',
	'TypeAnswer',
	'Slider',
	'Pin',
	'Order',
	'Poll',
	'Scale',
	'FreeText',
	'Brainstorm',
	'InfoSlide'
] as const satisfies readonly QuestionType[];

/** Which question type a slide holds. */
export function getQuestionType<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): QuestionType {
	for (const kind of questionTypes) {
		if (kind in slide) return kind;
	}
	throw new Error('Unknown slide type');
}

/** The slide's own body, keyed off whichever question type it turned out to be. */
type SlideBody<T> = { title: string; media?: T; points_awarded?: number };

function getBody<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): SlideBody<T> {
	return (slide as Record<QuestionType, SlideBody<T>>)[getQuestionType(slide)];
}

export type GenericFuizConfig<T> = {
	title: string;
	slides: GenericSlide<T>[];
};

export type FuizConfig = GenericFuizConfig<Media | undefined>;

export type GenericIdlessFuizConfig<T> = {
	title: string;
	slides: GenericIdlessSlide<T>[];
};

export type IdlessFullFuizConfig = GenericIdlessFuizConfig<Base64Media | undefined>;

export type IdlessFuizConfig = GenericIdlessFuizConfig<Media | undefined>;

export type IdlessLocalReferenceFuizConfig = GenericIdlessFuizConfig<UrlMedia | undefined>;

export type Creation = {
	id: number;
	/** Stable across devices, unlike `id`; this is what reports link back to. */
	uniqueId: string;
	title: string;
	lastEdited: number;
	slidesCount: number;
	media?: Media;
};

export type NameStyle =
	| {
			Roman: 2 | 3;
	  }
	| {
			Petname: 2 | 3;
	  };

export type FuizOptions = {
	random_names: NameStyle | null;
	show_answers: boolean;
	no_leaderboard: boolean;
	profanity?: 'Censor' | 'Allow';
	teams?: {
		size: number;
		assign_random: boolean;
	};
};

export type ServerPossiblyHidden<T> =
	| {
			Visible: T;
	  }
	| 'Hidden';

export type PublishedFuizDB = {
	storage_id: number;
	title: string;
	author: string;
	published_at: string;
	subjects: string | null;
	grades: string | null;
	slides_count: number;
	played_count: number;
	thumbnail_alt: string | null;
	language: string;
	thumbnail: ArrayBuffer | null;
};

export const grades = ['University', 'Secondary-School', 'Primary-School', 'Other'] as const;

export const subjects = [
	'Art',
	'Business',
	'Computer Science',
	'Culture and Traditions',
	'English Language Arts',
	'Finance',
	'General Knowledge',
	'Geography',
	'History',
	'Languages',
	'Law',
	'Math',
	'Music',
	'Science',
	'Seasonal',
	'Social Emotional Learning',
	'Social Studies',
	'Trivia'
] as const;

// https://gist.github.com/ackvf/de21847e78083034252961d550963579#file-global-d-ts-L154
export type Modify<T, R extends PartialAny<T>> = Omit<T, keyof R> & R;
/* eslint-disable */
type PartialAny<T> = {
	[P in keyof T]?: any;
};

export type PublishedFuiz = Modify<
	PublishedFuizDB,
	{
		thumbnail: string | null;
		subjects: string[];
		grades: string[];
		published_at: Date;
		language: string;
	}
>;

export type OnlineFuizMetadata = {
	author: string;
	subjects?: string[];
	grades?: string[];
	keywords?: string[];
	language: string;
};

export type FullOnlineFuiz = {
	config: IdlessFullFuizConfig;
} & OnlineFuizMetadata;

export type ReferencingOnlineFuiz = {
	config: IdlessLocalReferenceFuizConfig;
} & OnlineFuizMetadata;
