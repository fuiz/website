import JSZip from 'jszip';
import { parse } from 'smol-toml';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { env } from '$env/dynamic/public';
import { stringifyToml, urlifyBase64 } from '$lib';
import * as m from '$lib/paraglide/messages.js';
import { localizeHref } from '$lib/paraglide/runtime';
import BlueberryIcon from '~icons/custom/blueberry';
import GrapeIcon from '~icons/custom/grape';
import KiwiIcon from '~icons/custom/kiwi';
import LemonIcon from '~icons/custom/lemon';
import OliveIcon from '~icons/custom/olive';
import OrangeIcon from '~icons/custom/orange';
import StrawberryIcon from '~icons/custom/strawberry';
import WatermelonIcon from '~icons/custom/watermelon';
import {
	type Base64Media,
	type CorkboardMedia,
	type FuizConfig,
	type FuizOptions,
	type GenericFuizConfig,
	type GenericIdlessFuizConfig,
	type GenericIdlessSlide,
	type GenericSlide,
	getQuestionType,
	getTitle,
	type IdlessFuizConfig,
	type IdlessFullFuizConfig,
	mapIdlessSlidesMedia,
	type QuestionType
} from './types';
import { bring } from './util';

export function downloadBlob(blobs: BlobPart[], name: string, options?: FilePropertyBag) {
	const file = new File(blobs, name, options);
	const url = URL.createObjectURL(file);

	const link = document.createElement('a');
	link.style.display = 'none';
	link.href = url;
	link.download = file.name;
	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

export function downloadTomlString(str: string, title: string) {
	downloadBlob([str], title + '.toml', { type: 'application/toml', endings: 'native' });
}

export async function createZip(fuizString: string, images: { name: string; base64: string }[]) {
	const archive = JSZip();
	archive.file('config.toml', fuizString);

	images.forEach(({ name, base64 }) => {
		archive.file(name, base64, { base64: true });
	});

	return await archive.generateAsync({ type: 'blob', compression: 'STORE' });
}

export async function downloadFuiz(configJson: IdlessFullFuizConfig) {
	const [urlified, images] = urlifyBase64(configJson);

	if (images.length > 0) {
		downloadBlob([await createZip(stringifyToml(urlified), images)], configJson.title + '.zip');
	} else {
		downloadTomlString(stringifyToml(urlified), urlified.title);
	}
}

/** A title can hold anything, including `/`, which would become a folder inside the zip. */
const ILLEGAL_FILENAME_CHARS = '\\/:*?"<>|';

function safeFileName(name: string): string {
	const cleaned = [...name]
		.filter((char) => char >= ' ' && !ILLEGAL_FILENAME_CHARS.includes(char))
		.join('')
		// Stripping a character can leave the spaces that surrounded it doubled up.
		.replace(/\s+/g, ' ')
		.trim();
	return cleaned || 'fuiz';
}

/** Two quizzes called "New Quiz" would otherwise overwrite each other in the archive. */
function uniqueFileName(base: string, extension: string, used: Set<string>): string {
	let name = `${base}.${extension}`;
	let attempt = 2;
	while (used.has(name)) {
		name = `${base} (${attempt++}).${extension}`;
	}
	used.add(name);
	return name;
}

/**
 * One archive holding every given fuiz. Each entry keeps the shape `downloadFuiz` would
 * have produced on its own: a `.zip` when the fuiz carries images, a bare `.toml` when it
 * doesn't, so unzipping once leaves files that import directly.
 */
export async function downloadFuizzes(configs: IdlessFullFuizConfig[], name = 'fuizzes') {
	if (configs.length === 0) return;
	if (configs.length === 1) return await downloadFuiz(configs[0]);

	const archive = JSZip();
	const used = new Set<string>();

	for (const config of configs) {
		const [urlified, images] = urlifyBase64(config);
		const toml = stringifyToml(urlified);
		const base = safeFileName(config.title);

		if (images.length > 0) {
			archive.file(uniqueFileName(base, 'zip', used), await createZip(toml, images));
		} else {
			archive.file(uniqueFileName(base, 'toml', used), toml);
		}
	}

	downloadBlob(
		[await archive.generateAsync({ type: 'blob', compression: 'STORE' })],
		`${name}.zip`
	);
}

export async function loadZip(file: Blob): Promise<IdlessFullFuizConfig | undefined> {
	const mimetypes = new Map([
		['apng', 'image/apng'],
		['avif', 'image/avif'],
		['gif', 'image/gif'],
		['jpg', 'image/jpeg'],
		['png', 'image/png'],
		['svg', 'image/svg+xml'],
		['webp', 'image/webp']
	]);

	const archive = new JSZip();
	await archive.loadAsync(file);
	const images = Object.keys(archive.files)
		.filter((name) => !name.endsWith('.toml'))
		.map((name) => ({
			name,
			file: archive.files[name]
		}));

	const fuiz = Object.keys(archive.files)
		.filter((name) => name.endsWith('.toml'))
		.map((name) => archive.files[name])
		.at(0);

	const betterImages: { name: string; base64: string }[] = [];

	for (const { name, file } of images) {
		const base64 =
			'data:' +
			mimetypes.get(file.name.split('.').at(-1) ?? 'png') +
			';base64,' +
			(await file.async('base64'));
		betterImages.push({ name, base64 });
	}

	if (!fuiz) return undefined;

	const str = await fuiz.async('string');
	const detomlified = parse(str) as IdlessFuizConfig;

	const unurlify = (imageUrl: string): string => {
		return betterImages.find(({ name }) => name === imageUrl)?.base64 ?? '';
	};

	return await mapIdlessSlidesMedia(detomlified, async (media) => {
		if (media?.Image && 'Url' in media.Image) {
			return {
				Image: {
					Base64: {
						alt: media.Image.Url.alt,
						data: unurlify(media.Image.Url.url),
						hash: media.Image.Url.url.split('.')[0]
					}
				}
			};
		}
		return undefined;
	});
}

export async function loadSingleToml(file: Blob) {
	const str = await file.text();
	const detomlified = parse(str) as IdlessFullFuizConfig;

	return detomlified;
}

export async function shareAndCopyURL(config: IdlessFullFuizConfig) {
	const id = await (
		await fetch('/share', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(config)
		})
	).json();
	navigator.clipboard.writeText(env.PUBLIC_PLAY_URL + localizeHref('/share') + '/' + id);
}

/**
 * Rebuilds a slide from just its body, dropping the editor-only ids that hang
 * off the slide and its answers. Used for the slide types whose answers carry
 * no ids of their own.
 */
function bodyOnly<T>(slide: GenericIdlessSlide<T> | GenericSlide<T>): GenericIdlessSlide<T> {
	const kind = getQuestionType(slide);
	return { [kind]: (slide as Record<QuestionType, unknown>)[kind] } as GenericIdlessSlide<T>;
}

export function removeIds<T>(
	config: GenericIdlessFuizConfig<T> | GenericFuizConfig<T>
): GenericIdlessFuizConfig<T> {
	return {
		title: config.title,
		slides: config.slides.map((slide) => {
			switch (true) {
				case 'MultipleChoice' in slide:
					return {
						MultipleChoice: {
							...slide.MultipleChoice,
							answers: slide.MultipleChoice.answers.map(({ content, correct }) => ({
								content,
								correct
							}))
						}
					};
				case 'Poll' in slide:
					return {
						Poll: {
							...slide.Poll,
							answers: slide.Poll.answers.map(({ content }) => ({ content }))
						}
					};
				case 'TypeAnswer' in slide:
					return {
						TypeAnswer: {
							...slide.TypeAnswer,
							answers: slide.TypeAnswer.answers.map((text) =>
								typeof text === 'string' ? text : text.text
							)
						}
					};
				case 'Order' in slide:
					return {
						Order: {
							...slide.Order,
							answers: slide.Order.answers.map((text) =>
								typeof text === 'string' ? text : text.text
							)
						}
					};
				default:
					// Slider, scale, pin, free text, brainstorm and info slides
					// have no id-bearing answers to strip.
					return bodyOnly(slide);
			}
		})
	};
}

export function addIds<T>(config: GenericIdlessFuizConfig<T>): GenericFuizConfig<T> {
	return {
		title: config.title,
		slides: config.slides.map((slide, id) => {
			switch (true) {
				case 'MultipleChoice' in slide:
					return {
						MultipleChoice: {
							...slide.MultipleChoice,
							answers: slide.MultipleChoice.answers.map(({ content, correct }, id) => ({
								content,
								correct,
								id
							}))
						},
						id
					};
				case 'Poll' in slide:
					return {
						Poll: {
							...slide.Poll,
							answers: slide.Poll.answers.map(({ content }, id) => ({ content, id }))
						},
						id
					};
				case 'TypeAnswer' in slide:
					return {
						TypeAnswer: {
							...slide.TypeAnswer,
							answers: slide.TypeAnswer.answers.map((text, id) => ({
								text,
								id
							}))
						},
						id
					};
				case 'Order' in slide:
					return {
						Order: {
							...slide.Order,
							answers: slide.Order.answers.map((text, id) => ({
								text,
								id
							}))
						},
						id
					};
				default:
					return { ...bodyOnly(slide), id } as GenericSlide<T>;
			}
		})
	};
}

/**
 * Which local creation a game was launched from. The backend is never told, so this is
 * stashed alongside the watcher id and read back when the game ends, and it's what lets a
 * saved report link to the quiz that produced it, and it survives a mid-game reload.
 */
export type FuizOrigin = { uniqueId: string; versionId: number };

export function getFuizOrigin(code: string): FuizOrigin | undefined {
	const raw = localStorage.getItem(code + '_fuiz');
	if (!raw) return undefined;
	try {
		return JSON.parse(raw) as FuizOrigin;
	} catch {
		return undefined;
	}
}

async function playJsonString(config: string, origin?: FuizOrigin): Promise<undefined | string> {
	const res = await bring(env.PUBLIC_BACKEND_URL + '/add', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: config
	});

	if (res === undefined) return 'Inaccessible Server';
	if (!res.ok) return await res.text();

	const { game_id, watcher_id } = await res.json();

	localStorage.setItem(game_id + '_host', watcher_id);
	if (origin) {
		localStorage.setItem(game_id + '_fuiz', JSON.stringify(origin));
	}

	await goto(resolve(localizeHref('/host/' + game_id)));
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

class ImageUploadError extends Error {
	slideContext: GenericIdlessSlide<object | undefined> | undefined;
	slideIndex: number | undefined;

	constructor(message: string) {
		super(message);
		this.name = 'ImageUploadError';
		this.slideContext = undefined;
		this.slideIndex = undefined;
	}
}

async function getBackendMedia(
	media: Base64Media | undefined
): Promise<CorkboardMedia | undefined> {
	if (!media) {
		return undefined;
	}
	const { data, alt } = media.Image.Base64;

	const imageRes = await bring(data);
	if (!imageRes) return;

	const formData = new FormData();
	formData.append('image', await imageRes.blob());

	const res = await bring(env.PUBLIC_CORKBOARD_URL + '/upload', {
		method: 'POST',
		mode: 'cors',
		body: formData
	});

	if (res === undefined) {
		throw new ImageUploadError('Inaccessible Corkboard Server');
	}

	if (!res.ok) {
		throw new ImageUploadError('Server Error: ' + res.status + ' ' + (await res?.text()));
	}

	const id = await res.json();
	if (!id) {
		throw new ImageUploadError('No ID returned');
	}

	return {
		Image: {
			Corkboard: { id, alt }
		}
	};
}

async function getBackendConfig(config: IdlessFullFuizConfig): Promise<IdlessFuizConfig> {
	return await mapIdlessSlidesMedia(config, getBackendMedia);
}

export async function playIdlessConfig(
	config: IdlessFullFuizConfig,
	options: FuizOptions,
	origin?: FuizOrigin
): Promise<undefined | string> {
	let backendReadyConfig: IdlessFuizConfig;
	try {
		backendReadyConfig = await getBackendConfig(config);
	} catch (error) {
		if (error instanceof ImageUploadError) {
			let imageIdentifier = 'image';
			if (error.slideIndex !== undefined) {
				imageIdentifier = imageIdentifier + ` at index ${error.slideIndex + 1}`;
			}
			if (error.slideContext !== undefined) {
				imageIdentifier = imageIdentifier + ` with title "${getTitle(error.slideContext)}"`;
			}
			return `Failed to upload ${imageIdentifier}: ${error.message}`;
		}
		return 'Failed to upload images: ' + (error as Error).message;
	}
	try {
		return await playJsonString(
			JSON.stringify({
				config: fixTimes(backendReadyConfig),
				options
			}),
			origin
		);
	} catch {
		return 'Failed to start game';
	}
}

export async function playBackendReadyIdConfig(
	config: FuizConfig,
	options: FuizOptions,
	origin?: FuizOrigin
): Promise<undefined | string> {
	return await playJsonString(
		JSON.stringify({
			config: removeIds(config),
			options
		}),
		origin
	);
}

/**
 * Button palette. Numeric values are wrapped to the 8-slot answer-button palette;
 * named values ('secondary', 'tertiary', 'gitlab', 'ghost') target non-answer CTAs.
 * Token definitions live in `src/routes/+layout.svelte` under `.palette-*`.
 */
const PALETTE_SIZE = 8;

export type Palette = number | 'secondary' | 'tertiary' | 'gitlab' | 'slack' | 'ghost';

export function paletteClass(palette: Palette | undefined): string | undefined {
	if (palette === undefined) return undefined;
	if (typeof palette === 'number') return `palette-${palette % PALETTE_SIZE}`;
	return `palette-${palette}`;
}

export const medalColors = ['#C8A200', '#A0A0A0', '#B07D3B'] as const;

export const buttonSymbols = [
	{
		icon: StrawberryIcon,
		label: m.strawberry()
	},
	{
		icon: BlueberryIcon,
		label: m.blueberries()
	},
	{
		icon: KiwiIcon,
		label: m.kiwi()
	},
	{
		icon: OrangeIcon,
		label: m.orange()
	},
	{
		icon: GrapeIcon,
		label: m.grape()
	},
	{
		icon: OliveIcon,
		label: m.olives()
	},
	{
		icon: LemonIcon,
		label: m.lemon()
	},
	{
		icon: WatermelonIcon,
		label: m.watermelon()
	}
] as const;

// must be a subset of https://gitlab.com/fuiz/game-backend/-/raw/main/game/logic/src/settings.rs
export const limits = {
	fuiz: {
		maxSlidesCount: 500,
		maxTitleLength: 500,
		maxPlayerCount: 1000,
		multipleChoice: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxAnswerCount: 8
		},
		typeAnswer: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 60000,
			maxAnswerCount: 16
		},
		order: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 60000,
			maxAnswerCount: 8
		},
		slider: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxUnitLength: 20,
			// Mirrors the backend's `slider.max_steps`: enough stops for any
			// sensible question, few enough that a client can render the track.
			maxSteps: 10000
		},
		scale: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxLabelLength: 250,
			maxPointsCount: 11,
			// Agreement scales run 1..N; the NPS scale is fixed at 0..10.
			allowedAgreementMaximums: [3, 4, 5, 6, 7, 10],
			defaultAgreementMax: 5,
			npsMin: 0,
			npsMax: 10
		},
		poll: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxAnswerCount: 8
		},
		pin: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000
		},
		freeText: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 60000,
			maxEntriesPerPlayer: 5,
			maxEntryLength: 200,
			allowedEntryCounts: [1, 2, 3, 4, 5],
			wordCloudEntries: 3,
			wordCloudEntryLength: 40,
			openEndedEntries: 1,
			openEndedEntryLength: 200
		},
		brainstorm: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultIdeaTimeLimit: 120000,
			defaultVoteTimeLimit: 60000,
			maxIdeasPerPlayer: 3,
			maxVotesPerPlayer: 3,
			maxIdeaLength: 200,
			allowedIdeaCounts: [1, 2, 3],
			allowedVoteCounts: [1, 2, 3]
		},
		infoSlide: {
			maxTitleLength: 500,
			maxBodyLength: 2000,
			allowedDurations: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultDuration: null
		},
		maxAnswerTextLength: 500
	}
} as const;
