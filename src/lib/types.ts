import type { Locale } from '$lib/paraglide/runtime.js';

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
	introduce_question: number;
	time_limit: number;
	points_awarded: number;
	answer_mode?: AnswerMode;

	answers: IdlessMultipleChoiceAnswer[];
};

export type IdlessMultipleChoiceSlide = GenericIdlessMultipleChoiceSlide<Media | undefined>;

export type GenericIdlessTypeAnswer<T> = {
	title: string;
	media?: T;
	introduce_question: number;
	time_limit: number;
	points_awarded: number;
	answers: string[];
	case_sensitive: boolean;
};

export type IdlessTypeAnswer = GenericIdlessTypeAnswer<Media | undefined>;

export type GenericIdlessOrderSlide<T> = {
	title: string;
	media?: T;
	introduce_question: number;
	time_limit: number;
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

export function getTitle<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): string {
	if ('MultipleChoice' in slide) return slide.MultipleChoice.title;
	if ('TypeAnswer' in slide) return slide.TypeAnswer.title;
	if ('Order' in slide) return slide.Order.title;
	throw new Error('Unknown slide type');
}

export function getMedia<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): T | undefined {
	if ('MultipleChoice' in slide) return slide.MultipleChoice.media;
	if ('TypeAnswer' in slide) return slide.TypeAnswer.media;
	if ('Order' in slide) return slide.Order.media;
	return undefined;
}

async function mapIdlessMedia<T, O>(
	slide: GenericIdlessSlide<T | undefined>,
	map: (media: T | undefined) => Promise<O>
): Promise<GenericIdlessSlide<O>> {
	if ('MultipleChoice' in slide)
		return {
			MultipleChoice: {
				...slide.MultipleChoice,
				media: await map(slide.MultipleChoice.media)
			}
		};
	if ('TypeAnswer' in slide)
		return {
			TypeAnswer: {
				...slide.TypeAnswer,
				media: await map(slide.TypeAnswer.media)
			}
		};
	if ('Order' in slide)
		return {
			Order: { ...slide.Order, media: await map(slide.Order.media) }
		};
	return slide;
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
	if ('MultipleChoice' in slide)
		return {
			MultipleChoice: {
				...slide.MultipleChoice,
				media: map(slide.MultipleChoice.media)
			}
		};
	if ('TypeAnswer' in slide)
		return {
			TypeAnswer: {
				...slide.TypeAnswer,
				media: map(slide.TypeAnswer.media)
			}
		};
	if ('Order' in slide)
		return {
			Order: { ...slide.Order, media: map(slide.Order.media) }
		};
	return slide;
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
	  };

export type Slide = GenericSlide<Media | undefined>;

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
	title: string;
	lastEdited: number;
	slidesCount: number;
	media?: Media | undefined;
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
		language: Locale;
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
