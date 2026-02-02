import JSZip from 'jszip';
import { mapIdlessMedia, type IdlessFuizConfig, type IdlessFullFuizConfig } from './types';
import { parse } from '@ltd/j-toml';
import { stringifyToml, tomlifyConfig, urlifyBase64 } from '$lib';

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
		await downloadTomlString(stringifyToml(tomlifyConfig(urlified)), urlified.title);
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

	return {
		...detomlified,
		slides: await Promise.all(
			detomlified.slides.map(
				async (s) =>
					await mapIdlessMedia(s, async (media) => {
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
					})
			)
		)
	};
}

export async function loadSingleToml(file: Blob) {
	const str = await file.text();
	const detomlified = parse(str, { bigint: false }) as IdlessFullFuizConfig;

	return detomlified;
}
