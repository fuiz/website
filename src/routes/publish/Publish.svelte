<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { tomlifyConfig, stringifyToml } from '$lib';
	import Textfield from '$lib/Textfield.svelte';
	import TypicalPage from '$lib/TypicalPage.svelte';
	import SelectTime from '$lib/SelectTime.svelte';
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js';
	import Icon from '$lib/Icon.svelte';
	import FancyButton from '$lib/FancyButton.svelte';
	import MediaContainer from '$lib/MediaContainer.svelte';
	import { deserialize } from '$app/forms';
	import { getMedia, type Media } from '$lib/types';
	import { updateCreation, type Database, type ExportedFuiz } from '$lib/storage';
	import { page } from '$app/state';
	import Subject from './Subject.svelte';
	import Grade from './Grade.svelte';

	interface Props {
		creation: ExportedFuiz;
		id: number;
		db: Database;
	}

	let { creation = $bindable(), id, db }: Props = $props();

	let author = $state(page.data.session?.user?.name || '');
	let subjects: string[] = $state([]);
	let grades: string[] = $state([]);
	let lang = $state(languageTag());

	function map(lang: string): string {
		return (
			new Intl.DisplayNames([lang], {
				type: 'language'
			}).of(lang) || lang
		);
	}

	let media = $derived(
		creation.config.slides.reduce<Media | undefined>((m, s) => m || getMedia(s), undefined)
	);

	async function publish() {
		const formdata = new FormData();
		formdata.append(
			'config',
			stringifyToml({
				author,
				subjects: subjects,
				grades: grades,
				language: lang,
				config: tomlifyConfig(creation.config)
			})
		);

		const released = creation.publish?.released_r2_key;
		if (released) {
			formdata.append('id', released);
		}

		const res = await fetch(released ? '?/request_update' : '?/request_publish', {
			method: 'POST',
			mode: 'same-origin',
			body: formdata,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		const resjson = deserialize(await res.text());

		if (resjson.type !== 'success') return;

		/* eslint-disable */
		const { r2_key }: { r2_key: string | undefined } = (resjson.data as any) || {
			r2_key: undefined
		};

		if (!r2_key) return;

		creation = {
			...creation,
			publish: {
				...creation.publish,
				pending_r2_key: r2_key
			}
		};

		await updateCreation(id, creation, db);
	}

	let reasonState: string | undefined = $state(undefined);

	async function checkRequest(
		pending_r2_key: string | undefined
	): Promise<'pending' | 'approved' | 'denied' | undefined> {
		if (!pending_r2_key) return undefined;
		const formdata = new FormData();
		formdata.append('r2_key', pending_r2_key);
		const res = await fetch('?/check_publish', {
			method: 'POST',
			mode: 'same-origin',
			body: formdata,
			headers: {
				'x-sveltekit-action': 'true'
			}
		});

		const resjson = deserialize(await res.text());
		if (resjson.type !== 'success') return undefined;

		const {
			status,
			reason
		}: { status: 'pending' | 'approved' | 'denied' | undefined; reason: string | undefined } =
			/* eslint-disable */
			(resjson.data as any) || {
				status: undefined
			};

		if (!status) return undefined;

		if (reason) {
			reasonState = reason;
		}

		if (status === 'approved' || status === 'denied') {
			creation = {
				...creation,
				publish: {
					...creation.publish,
					...(status === 'approved' && { released_r2_key: pending_r2_key }),
					pending_r2_key: undefined
				}
			};

			await updateCreation(id, creation, db);
		}

		return status;
	}

	let requestStatus = $derived(checkRequest(creation.publish?.pending_r2_key));

	async function memorize(
		requestStatus: Promise<'pending' | 'approved' | 'denied' | undefined>
	): Promise<'pending' | 'approved' | 'denied' | undefined> {
		return (await rememberStatus) || (await requestStatus);
	}

	let rememberStatus = $derived(memorize(requestStatus));
</script>

<TypicalPage>
	<section style:max-width="40ch" style:margin="auto">
		{#if !creation?.publish?.pending_r2_key}
			<form
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:flex-direction="column"
				style:gap="0.5em"
				onsubmit={(e) => {
					e.preventDefault();
					publish();
				}}
			>
				{#await rememberStatus then res}
					{#if res === 'approved' || creation?.publish?.released_r2_key}
						<p>{m.request_approved()}</p>
					{:else if res === 'denied'}
						<p>
							{m.request_denied({ reasonState: reasonState || m.unknown() })}
						</p>
					{/if}
				{/await}
				<div
					style:border="0.15em solid"
					style:border-radius="0.5em"
					style:overflow="hidden"
					style:width="fit-content"
					style:margin="auto"
				>
					<div
						style:aspect-ratio="3 / 2"
						style:height="10em"
						style:width="auto"
						style:margin="auto"
						style:position="relative"
					>
						<MediaContainer {media} fit="cover" />
					</div>
					<div
						style:padding="0.15em 0.3em"
						style:word-break="break-word"
						style:border-top="0.15em solid"
					>
						{creation.config.title}
					</div>
				</div>
				<Textfield
					id="author"
					placeholder={m.author()}
					required
					disabled={false}
					showInvalid={false}
					bind:value={author}
				/>
				<Subject bind:tags={subjects} />
				<Grade bind:tags={grades} />
				<div>
					<SelectTime options={[...availableLanguageTags]} bind:selected={lang} {map}>
						<Icon src="$lib/assets/language.svg" alt={m.language()} size="1em" />
					</SelectTime>
				</div>
				<div>
					<FancyButton
						><div style:font-family="Poppins">
							{#if creation.publish?.released_r2_key}
								{m.request_update()}
							{:else}
								{m.request_publish()}
							{/if}
						</div>
					</FancyButton>
				</div>
			</form>
		{:else}
			Request is pending
		{/if}
	</section>
</TypicalPage>

<style>
	p {
		margin: 0;
	}
</style>
