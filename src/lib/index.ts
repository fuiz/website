import * as m from '$lib/paraglide/messages.js';

import strawberry from '$lib/assets/icons/fruits/strawberry.svg';
import grape from '$lib/assets/icons/fruits/grape.svg';
import lemon from '$lib/assets/icons/fruits/lemon.svg';
import blueberry from '$lib/assets/icons/fruits/blueberry.svg';
import kiwi from '$lib/assets/icons/fruits/kiwi.svg';
import orange from '$lib/assets/icons/fruits/orange.svg';
import olive from '$lib/assets/icons/fruits/olive.svg';
import watermelon from '$lib/assets/icons/fruits/watermelon.svg';
import { Section, stringify } from '@ltd/j-toml';
import {
	mapIdlessSlidesMediaSync,
	type IdlessFullFuizConfig,
	type IdlessLocalReferenceFuizConfig,
	type ReferencingOnlineFuiz
} from './types';
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
	const lowerExt = extension.toLowerCase().trim();
	const entry = mimeTypeToExtensionMapping.entries().find(([, ext]) => ext === lowerExt);
	return entry ? entry[0] : null;
}

function getMimetype(base64string: string): string {
	return base64string.split(';')[0].split(':')[1];
}

function urlifyImage({ data, hash }: { data: string; hash?: string }): {
	name: string;
	base64: string;
} {
	const mimetype = getMimetype(data);
	const ext = mimeTypeToExtension(mimetype);
	if (!ext) throw new Error(`Unsupported image mimetype: ${mimetype}`);
	const name = (hash ?? objectHash(data)) + '.' + ext;
	return {
		name,
		base64: data.split(',')[1]
	};
}

export function urlifyBase64(
	config: IdlessFullFuizConfig
): [IdlessLocalReferenceFuizConfig, { name: string; base64: string }[]] {
	const images: { name: string; base64: string }[] = [];

	const urlifiedConfig = mapIdlessSlidesMediaSync(config, (media) => {
		if (media) {
			const urlified = urlifyImage(media.Image.Base64);
			images.push(urlified);
			return {
				Image: {
					Url: {
						alt: media.Image.Base64.alt,
						url: urlified.name
					}
				}
			};
		}
		return undefined;
	});
	return [urlifiedConfig, images];
}
