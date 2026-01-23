<script>
	import { onMount } from 'svelte';
	import { addCreation, generateUuid, loadDatabase } from '$lib/storage';
	import { goto } from '$app/navigation';
	import Loading from '$lib/Loading.svelte';
	import { mapIdlessMedia } from '$lib/types';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();

	onMount(async () => {
		const db = await loadDatabase();
		/** @type {import('$lib/storage').MediaReferencedFuizConfig} */
		const config = JSON.parse(data.content);

		/**
		 * @param {string} hash
		 */
		const dereferenceImage = async (hash) => {
			const resp = await fetch('/api/gdrive/images/' + hash);
			return await resp.text();
		};

		/** @type {import('$lib/types').IdlessFuizConfig} */
		const fuizWithoutRef = {
			...config,
			slides: await Promise.all(
				config.slides.map(
					async (s) =>
						await mapIdlessMedia(s, async (s) => {
							if (s && typeof s !== 'string' && 'HashReference' in s.Image) {
								return {
									Image: {
										Base64: {
											alt: s.Image.HashReference.alt,
											hash: s.Image.HashReference.hash,
											data: await dereferenceImage(s.Image.HashReference.hash)
										}
									}
								};
							}
							return undefined;
						})
				)
			)
		};

		const id = await addCreation(
			{ lastEdited: Date.now(), uniqueId: generateUuid(), versionId: 0, config: fuizWithoutRef },
			db
		);

		await goto(localizeHref('/create') + '?id=' + id.toString());
	});
</script>

<Loading />
