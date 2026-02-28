import { parse } from '@ltd/j-toml';
import JSZip from 'jszip';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { PUBLIC_BACKEND_URL, PUBLIC_CORKBOARD_URL, PUBLIC_PLAY_URL } from '$env/static/public';
import { assertUnreachable, stringifyToml, tomlifyConfig, urlifyBase64 } from '$lib';
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
	getTitle,
	type IdlessFuizConfig,
	type IdlessFullFuizConfig,
	mapIdlessSlidesMedia
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
		downloadBlob(
			[await createZip(stringifyToml(tomlifyConfig(urlified)), images)],
			configJson.title + '.zip'
		);
	} else {
		downloadTomlString(stringifyToml(tomlifyConfig(urlified)), urlified.title);
	}
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
	const detomlified = parse(str, { bigint: false }) as IdlessFuizConfig;

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
	const detomlified = parse(str, { bigint: false }) as IdlessFullFuizConfig;

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
	navigator.clipboard.writeText(PUBLIC_PLAY_URL + localizeHref('/share') + '/' + id);
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
					return assertUnreachable(slide);
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
					return assertUnreachable(slide);
			}
		})
	};
}

async function playJsonString(config: string): Promise<undefined | string> {
	const res = await bring(PUBLIC_BACKEND_URL + '/add', {
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

	await goto(resolve(localizeHref('/host?code=' + game_id)));
}

function fixTime(time: number): number {
	return time <= 1000 ? time * 1000 : time;
}

export function fixTimes<T>(config: GenericIdlessFuizConfig<T>): GenericIdlessFuizConfig<T> {
	return {
		title: config.title,
		slides: config.slides.map((slide) => {
			switch (true) {
				case 'MultipleChoice' in slide:
					return {
						MultipleChoice: {
							...slide.MultipleChoice,
							introduce_question: fixTime(slide.MultipleChoice.introduce_question),
							time_limit: fixTime(slide.MultipleChoice.time_limit)
						}
					};
				case 'TypeAnswer' in slide:
					return {
						TypeAnswer: {
							...slide.TypeAnswer,
							introduce_question: fixTime(slide.TypeAnswer.introduce_question),
							time_limit: fixTime(slide.TypeAnswer.time_limit)
						}
					};
				case 'Order' in slide:
					return {
						Order: {
							...slide.Order,
							introduce_question: fixTime(slide.Order.introduce_question),
							time_limit: fixTime(slide.Order.time_limit)
						}
					};
				default:
					return assertUnreachable(slide);
			}
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

	const res = await bring(PUBLIC_CORKBOARD_URL + '/upload', {
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
	options: FuizOptions
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
			})
		);
	} catch {
		return 'Failed to start game';
	}
}

export async function playBackendReadyIdConfig(
	config: FuizConfig,
	options: FuizOptions
): Promise<undefined | string> {
	return await playJsonString(
		JSON.stringify({
			config: removeIds(config),
			options
		})
	);
}

export const buttonColors = [
	['hsl(358, 84%, 45%)', 'hsl(358, 84%, 35%)'],
	['hsl(205, 84%, 30%)', 'hsl(205, 84%, 20%)'],
	['hsl(120, 83%, 18%)', 'hsl(120, 83%, 8%)'],
	['hsl(25, 84%, 48%)', 'hsl(25, 84%, 38%)'],
	['hsl(318, 84%, 25%)', 'hsl(318, 84%, 15%)'],
	['hsl(179, 84%, 32%)', 'hsl(179, 84%, 22%)'],
	['hsl(69, 84%, 40%)', 'hsl(69, 84%, 30%)'],
	['hsl(0, 0%, 20%)', 'hsl(0, 0%, 10%)']
] as const;

export const medalColors = ['#FEDD1E', '#D0D0D0', '#D7995A'] as const;

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

// must be a subset of https://gitlab.com/fuiz/game/-/raw/main/config.toml
export const limits = {
	fuiz: {
		maxSlidesCount: 100,
		maxTitleLength: 200,
		maxPlayerCount: 1000,
		multipleChoice: {
			maxTitleLength: 200,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000],
			defaultTimeLimit: 30000,
			maxAnswerCount: 8
		},
		typeAnswer: {
			maxTitleLength: 200,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000],
			defaultTimeLimit: 60000,
			maxAnswerCount: 16
		},
		order: {
			maxTitleLength: 200,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000],
			defaultTimeLimit: 60000,
			maxAnswerCount: 8
		},
		maxAnswerTextLength: 200
	}
} as const;
