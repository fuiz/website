/**
 * The passes that bring a config into the one form the rest of the app and
 * the backend agree on. Configs arrive from the editor, imports, share links
 * and remote sync, some of them written by older versions; storage runs every
 * one through here on the way in and on the way out, so nothing downstream
 * has to allow for the variations. What gets posted to the server is always
 * something storage handed back or the server itself sent.
 */

import { limits } from './limits';
import {
	type GenericIdlessFuizConfig,
	type GenericIdlessSlide,
	getQuestionType,
	type QuestionType,
	type TextOrMedia
} from './types';

/**
 * Poll options used to be stored wrapped as `{ content }`, the multiple choice
 * shape minus its `correct` flag; the backend takes the bare content.
 */
type WrappedPollAnswer = { content: TextOrMedia };

function unwrapPollAnswer(answer: TextOrMedia | WrappedPollAnswer): TextOrMedia {
	return 'content' in answer ? answer.content : answer;
}

export function fixPollAnswers<T>(config: GenericIdlessFuizConfig<T>): GenericIdlessFuizConfig<T> {
	return {
		title: config.title,
		slides: config.slides.map((slide) =>
			'Poll' in slide
				? { Poll: { ...slide.Poll, answers: slide.Poll.answers.map(unwrapPollAnswer) } }
				: slide
		)
	};
}

function fixTime(time: number | null | undefined): number | null | undefined {
	if (time == null) return time;
	return time <= 1000 ? time * 1000 : time;
}

/**
 * Every field across all slide types that holds a duration. A slide only ever
 * carries a few of these; the rest are left alone.
 */
const DURATION_FIELDS = [
	'introduce_question',
	'time_limit',
	'idea_time_limit',
	'vote_time_limit',
	'duration'
] as const;

export function fixTimes<T>(config: GenericIdlessFuizConfig<T>): GenericIdlessFuizConfig<T> {
	return {
		title: config.title,
		slides: config.slides.map((slide) => {
			const kind = getQuestionType(slide);
			const body: Record<string, unknown> = {
				...(slide as unknown as Record<QuestionType, Record<string, unknown>>)[kind]
			};
			for (const field of DURATION_FIELDS) {
				if (field in body) {
					body[field] = fixTime(body[field] as number | null | undefined);
				}
			}
			return { [kind]: body } as GenericIdlessSlide<T>;
		})
	};
}

/** Truncates to `max` code points, which is how the backend counts `chars`. */
function fitText(text: string, max: number): string {
	return Array.from(text).slice(0, max).join('');
}

/**
 * Resamples a trace down to `max` points spread evenly along it, so the
 * outline keeps its shape rather than losing its tail.
 */
function fitPoints<P>(points: P[], max: number): P[] {
	if (points.length <= max) return points;
	return Array.from({ length: max }, (_, i) => points[Math.floor((i * points.length) / max)]);
}

/**
 * Caps the alt text of any image shape (base64, corkboard, url, or a storage
 * hash reference), all of which carry it as `Image.<variant>.alt`.
 */
function fitMediaAlt(media: unknown): unknown {
	if (typeof media !== 'object' || media === null || !('Image' in media)) return media;
	const image = media.Image as Record<string, { alt?: unknown }>;
	const [variant, inner] = Object.entries(image)[0] ?? [];
	if (!variant || typeof inner?.alt !== 'string') return media;
	return {
		Image: { [variant]: { ...inner, alt: fitText(inner.alt, limits.fuiz.maxImageAltLength) } }
	};
}

/**
 * Backend caps that no editor control enforces.
 */
export function fitLimits<T>(config: GenericIdlessFuizConfig<T>): GenericIdlessFuizConfig<T> {
	return {
		title: config.title,
		slides: config.slides.map((slide) => {
			const kind = getQuestionType(slide);
			const body: Record<string, unknown> = {
				...(slide as unknown as Record<QuestionType, Record<string, unknown>>)[kind]
			};
			if ('media' in body) body.media = fitMediaAlt(body.media);
			if ('Order' in slide) {
				const { from, to } = slide.Order.axis_labels;
				body.axis_labels = {
					...(from !== undefined && { from: fitText(from, limits.fuiz.order.maxLabelLength) }),
					...(to !== undefined && { to: fitText(to, limits.fuiz.order.maxLabelLength) })
				};
			}
			if ('Pin' in slide && slide.Pin.correct_area && 'Polygon' in slide.Pin.correct_area) {
				body.correct_area = {
					Polygon: {
						points: fitPoints(
							slide.Pin.correct_area.Polygon.points,
							limits.fuiz.pin.maxPolygonPoints
						)
					}
				};
			}
			return { [kind]: body } as GenericIdlessSlide<T>;
		})
	};
}

export function canonicalize<T>(config: GenericIdlessFuizConfig<T>): GenericIdlessFuizConfig<T> {
	return fitLimits(fixTimes(fixPollAnswers(config)));
}
