import { bring } from './util';
import { PUBLIC_CORKBOARD_URL } from '$env/static/public';
import {
	getMedia,
	type IdlessFullFuizConfig,
	type PublishedFuiz,
	type PublishedFuizDB
} from './types';
import type { Locale } from '$lib/paraglide/runtime.js';

export function dataURIToBlob(dataURI: string): Blob {
	const [info, data] = dataURI.split(',');

	const mimeString = info.split(';')[0].split(':')[1];

	return new Blob([Uint8Array.fromBase64(data)], {
		type: mimeString
	});
}

export async function getThumbnail(
	fuiz: IdlessFullFuizConfig
): Promise<{ thumbnail: ArrayBuffer; thumbnailAlt: string } | undefined> {
	return await fuiz.slides.reduce<
		Promise<{ thumbnail: ArrayBuffer; thumbnailAlt: string } | undefined> | undefined
	>(async (m, s) => {
		const prev = await m;
		if (prev) return prev;
		const media = getMedia(s);
		if (!media) return undefined;
		const blob = dataURIToBlob(media.Image.Base64.data);

		const formData = new FormData();
		formData.append('image', blob);

		const thumbnail = await bring(PUBLIC_CORKBOARD_URL + '/thumbnail', {
			method: 'POST',
			body: formData
		});

		if (!thumbnail?.ok) return undefined;

		return { thumbnail: await thumbnail.arrayBuffer(), thumbnailAlt: media.Image.Base64.alt };
	}, undefined);
}

export function encodeAsDataURL(array: ArrayBuffer): string {
	let binary = '';
	for (const byte of new Uint8Array(array)) {
		binary += String.fromCharCode(byte);
	}
	return 'data:image/png;base64,' + btoa(binary);
}

export function fixPublish(p: PublishedFuizDB): PublishedFuiz {
	return {
		...p,
		thumbnail: p.thumbnail ? encodeAsDataURL(p.thumbnail) : null,
		subjects: p.subjects ? JSON.parse(p.subjects) : [],
		grades: p.grades ? JSON.parse(p.grades) : [],
		published_at: new Date(p.published_at),
		language: p.language as Locale
	};
}
