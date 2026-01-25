import * as m from '$lib/paraglide/messages.js';

import strawberry from '$lib/assets/fruits/strawberry.svg';
import grape from '$lib/assets/fruits/grape.svg';
import lemon from '$lib/assets/fruits/lemon.svg';
import blueberry from '$lib/assets/fruits/blueberry.svg';
import kiwi from '$lib/assets/fruits/kiwi.svg';
import orange from '$lib/assets/fruits/orange.svg';
import olive from '$lib/assets/fruits/olive.svg';
import watermelon from '$lib/assets/fruits/watermelon.svg';
import { PUBLIC_BACKEND_URL, PUBLIC_CORKBOARD_URL } from '$env/static/public';
import { goto } from '$app/navigation';
import { Section, stringify } from '@ltd/j-toml';
import { bring } from './util';
import {
	mapIdlessMedia,
	type FuizConfig,
	type FuizOptions,
	type GenericFuizConfig,
	type GenericIdlessFuizConfig,
	type IdlessFuizConfig,
	type IdlessFullFuizConfig,
	type IdlessLocalReferenceFuizConfig,
	type Media,
	type ReferencingOnlineFuiz
} from './types';
import JSZip from 'jszip';
import objectHash from 'object-hash';

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
	[strawberry, m.strawberry()],
	[blueberry, m.blueberries()],
	[kiwi, m.kiwi()],
	[orange, m.orange()],
	[grape, m.grape()],
	[olive, m.olives()],
	[lemon, m.lemon()],
	[watermelon, m.watermelon()]
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

export async function getBackendMedia(media: Media | undefined | null): Promise<Media | undefined> {
	if (!media) {
		return undefined;
	}
	if ('Base64' in media.Image) {
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

		const id = await res?.json();
		if (!id) return undefined;

		return {
			Image: {
				Corkboard: { id, alt }
			}
		};
	} else {
		return media;
	}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function assertUnreachable(_: never): never {
	throw new Error("it's impossible to reach here");
}

export function tomlifyConfig(
	config: IdlessLocalReferenceFuizConfig
): IdlessLocalReferenceFuizConfig {
	return {
		title: config.title,
		slides: config.slides.map((slide) => {
			switch (true) {
				case 'MultipleChoice' in slide:
					return Section({
						MultipleChoice: Section(slide.MultipleChoice)
					});
				case 'TypeAnswer' in slide:
					return Section({
						TypeAnswer: Section(slide.TypeAnswer)
					});
				case 'Order' in slide:
					return Section({
						Order: Section(slide.Order)
					});
				default:
					return assertUnreachable(slide);
			}
		})
	};
}

export function stringifyToml(obj: IdlessLocalReferenceFuizConfig | ReferencingOnlineFuiz): string {
	return stringify(obj, { newline: '\n', newlineAround: 'section', integer: 1000000 });
}

export async function downloadFuiz(configJson: IdlessFullFuizConfig) {
	const [urlified, images] = await urlifyBase64(configJson);

	if (images.length > 0) {
		downloadBlob(
			[await createZip(stringifyToml(tomlifyConfig(urlified)), images)],
			configJson.title + '.zip'
		);
	} else {
		await downloadTomlString(stringifyToml(tomlifyConfig(urlified)), urlified.title);
	}
}

const mimeTypeToExtensionMapping: Map<string, string> = new Map([
	['image/apng', 'apng'],
	['image/avif', 'avif'],
	['image/gif', 'gif'],
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/svg+xml', 'svg'],
	['image/webp', 'webp']
]);

export function mimeTypeToExtension(mimeType: string): string | null {
	return mimeTypeToExtensionMapping.get(mimeType) || null;
}

export function extensionToMimeType(extension: string): string | null {
	const lowerExt = extension.toLowerCase();
	const entry = Object.entries(mimeTypeToExtensionMapping).find(([, ext]) => ext === lowerExt);
	return entry ? entry[0] : null;
}

export async function urlifyBase64(
	config: IdlessFullFuizConfig
): Promise<[IdlessLocalReferenceFuizConfig, { name: string; base64: string }[]]> {
	function getMimetype(base64string: string): string {
		return base64string.split(';')[0].split(':')[1];
	}

	const images: { name: string; base64: string }[] = [];

	function urlifyImage({ data, hash }: { data: string; hash?: string }): string {
		const mimetype = getMimetype(data);
		const ext = mimeTypeToExtension(mimetype);
		if (!ext) throw new Error(`Unsupported image mimetype: ${mimetype}`);
		const name = (hash ?? objectHash(data)) + '.' + ext;
		images.push({
			name,
			base64: data.split(',')[1]
		});
		return name;
	}

	const urlifiedConfig = {
		...config,
		slides: await Promise.all(
			config.slides.map(
				async (s) =>
					await mapIdlessMedia(s, async (media) => {
						if (media) {
							return {
								Image: {
									Url: {
										alt: media.Image.Base64.alt,
										url: urlifyImage(media.Image.Base64)
									}
								}
							};
						}
						return undefined;
					})
			)
		)
	};
	return [urlifiedConfig, images];
}

export async function createZip(fuizString: string, images: { name: string; base64: string }[]) {
	const archive = JSZip();
	archive.file('config.toml', fuizString);

	images.forEach(({ name, base64 }) => {
		archive.file(name, base64, { base64: true });
	});

	return await archive.generateAsync({ type: 'blob', compression: 'STORE' });
}

export function downloadTomlString(str: string, title: string) {
	downloadBlob([str], title + '.toml', { type: 'application/toml', endings: 'native' });
}

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

export async function getBackendConfig(config: IdlessFuizConfig): Promise<IdlessFuizConfig> {
	return {
		title: config.title,
		slides: await Promise.all(
			config.slides.map(
				async (slide) => await mapIdlessMedia(slide, async (media) => await getBackendMedia(media))
			)
		)
	};
}

export async function playJsonString(config: string): Promise<undefined | string> {
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

	await goto('host?code=' + game_id);
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

export async function playIdlessConfig(
	config: IdlessFuizConfig,
	options: FuizOptions
): Promise<undefined | string> {
	try {
		const backendReadyConfig = await getBackendConfig(config);
		return await playJsonString(
			JSON.stringify({
				config: fixTimes(backendReadyConfig),
				options
			})
		);
	} catch {
		return 'Failed to upload images';
	}
}

export async function playConfig(
	config: FuizConfig,
	options: FuizOptions
): Promise<undefined | string> {
	return await playIdlessConfig(removeIds(config), options);
}
