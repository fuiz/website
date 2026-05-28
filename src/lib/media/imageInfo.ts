import { env } from '$env/dynamic/public';
import type { Media } from '$lib/types';

export type ImageInfo = { src: string; alt: string };

export function getImageInfo(media: Media): ImageInfo | undefined {
	if ('Base64' in media.Image) {
		if (media.Image.Base64.data === '') return undefined;
		return { src: media.Image.Base64.data, alt: media.Image.Base64.alt };
	}
	if ('Corkboard' in media.Image) {
		return {
			src: env.PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id,
			alt: media.Image.Corkboard.alt
		};
	}
	if ('Url' in media.Image) {
		return { src: media.Image.Url.url, alt: media.Image.Url.alt };
	}
	return undefined;
}
