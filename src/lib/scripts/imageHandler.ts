/**
 * Image handling utilities for Git sync
 */

import type { BaseGitClient } from '$lib/git/base';
import {
	type IdlessFullFuizConfig,
	type IdlessLocalReferenceFuizConfig,
	mapIdlessMedia,
	type UrlMedia,
	type Base64Media
} from '$lib/types';
import { extensionToMimeType } from '$lib';

/** Resolve media from Git repository
 */
export async function resolveMediaFromGit(
	media: UrlMedia | undefined,
	client: BaseGitClient,
	fuizId: string,
	ref?: string
): Promise<Base64Media | undefined> {
	if (!media) return undefined;

	const path = media.Image.Url.url;

	// Only process URL media that points to relative image filenames
	if (path.includes('/')) {
		return undefined;
	}

	// Images are now stored as just the filename (e.g., "abc123.png")
	// We need to construct the full path: fuizId/filename
	const fullPath = `${fuizId}/${media.Image.Url.url}`;
	const imageData = await client.getFileContent(fullPath, ref);
	if (imageData === null) {
		console.error('Failed to download image from Git:', fullPath);
		return undefined;
	}
	const base64String = imageData.toBase64();
	const extension = media.Image.Url.url.split('.').pop();
	if (!extension) {
		console.error('Could not determine file extension for image:', media.Image.Url.url);
		return undefined;
	}
	const mimeType = extensionToMimeType(extension);
	if (!mimeType) {
		console.error('Unsupported file extension for image:', extension);
		return undefined;
	}
	const dataUri = `data:${mimeType};base64,${base64String}`;

	return {
		Image: {
			Base64: {
				data: dataUri,
				alt: media.Image.Url.alt
			}
		}
	};
}

/** Fill media in fuiz config by downloading from Git
 */
export async function fillMediaFromGit(
	config: IdlessLocalReferenceFuizConfig,
	client: BaseGitClient,
	fuizId: string,
	ref?: string
): Promise<IdlessFullFuizConfig> {
	return {
		...config,
		slides: await Promise.all(
			config.slides.map(async (slide) =>
				mapIdlessMedia(slide, (media) => resolveMediaFromGit(media, client, fuizId, ref))
			)
		)
	};
}
