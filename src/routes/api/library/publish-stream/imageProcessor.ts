import { createHash } from 'crypto';
import type { Base64Media, UrlMedia } from '$lib/types';
import { mimeTypeToExtension } from '$lib';

interface ImageFile {
	path: string;
	content: string;
	encoding: 'base64';
	hash: string;
	extension: string;
}

/**
 * Extract image data from a data URI
 */
function extractBase64Image(dataUri: string): {
	data: string;
	mimeType: string;
	extension: string;
} | null {
	const parts = dataUri.split(',');
	if (parts.length !== 2) {
		return null;
	}
	const mimeMatch = parts[0].match(/data:(.*?);base64/);
	if (!mimeMatch) {
		return null;
	}
	const mimeType = mimeMatch[1];
	const data = parts[1];
	const ext = mimeTypeToExtension(mimeType);
	if (!ext) {
		return null;
	}

	return {
		data,
		mimeType,
		extension: ext
	};
}

/**
 * Process media and extract image files
 * Returns the modified media object with relative path and the image file data
 */
export function processMedia(
	media: Base64Media | undefined,
	imageFiles: Map<string, ImageFile>,
	fuizId: string
): UrlMedia | undefined {
	if (!media) return undefined;

	const base64Data = extractBase64Image(media.Image.Base64.data);
	if (!base64Data) {
		console.warn('Invalid base64 image data');
		return undefined;
	}
	const { data, extension } = base64Data;
	const hash = createHash('sha256').update(data).digest('hex').substring(0, 16);
	const filename = `${hash}.${extension}`;
	const path = `${fuizId}/${filename}`;

	if (!imageFiles.has(hash)) {
		imageFiles.set(hash, {
			path,
			content: data,
			encoding: 'base64',
			hash,
			extension
		});
	}

	return {
		Image: {
			Url: {
				url: filename,
				alt: media.Image.Base64.alt
			}
		}
	};
}
