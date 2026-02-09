import { Section, stringify } from '@ltd/j-toml';
import objectHash from 'object-hash';
import {
	type IdlessFullFuizConfig,
	type IdlessLocalReferenceFuizConfig,
	mapIdlessSlidesMediaSync,
	type ReferencingOnlineFuiz
} from './types';

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
