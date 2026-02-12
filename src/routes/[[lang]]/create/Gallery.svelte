<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		addIds,
		downloadFuiz,
		loadSingleToml,
		loadZip,
		removeIds,
		shareAndCopyURL
	} from '$lib/clientOnly';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import {
		addCreation,
		type CreationId,
		type Database,
		deleteCreation,
		generateUuid,
		getCreation
	} from '$lib/storage';
	import { type Creation, getMedia, type Media } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import { isNotUndefined, toSorted } from '$lib/util';
	import GhostIcon from '~icons/custom/ghost';
	import FileOpenOutline from '~icons/material-symbols/file-open-outline';
	import Login from '~icons/material-symbols/login';
	import Logout from '~icons/material-symbols/logout';
	import NoteAddOutline from '~icons/material-symbols/note-add-outline';
	import GalleryCreation from './GalleryCreation.svelte';

	let {
		creations = $bindable(),
		db,
		showShare
	}: {
		creations: Creation[];
		db: Database;
		showShare?: boolean;
	} = $props();

	let sortedCreations = $derived(toSorted(creations, (a, b) => b.lastEdited - a.lastEdited));

	async function newCreation() {
		let newSlide = {
			lastEdited: Date.now(),
			uniqueId: generateUuid(),
			versionId: 0,
			config: {
				title: m.untitled(),
				slides: []
			}
		};

		let id = await addCreation(newSlide, db);

		creations = [
			...creations,
			{
				id,
				lastEdited: newSlide.lastEdited,
				title: newSlide.config.title,
				slidesCount: newSlide.config.slides.length
			}
		];

		await goto(resolve(localizeHref(`/create?id=${id}`)));
	}

	async function deleteSlide(id: number) {
		await deleteCreation(id, db);
		creations = creations.filter((c) => c.id !== id);
	}

	let deleteDialog = $state<ConfirmationDialog>();
	let selectedToDeletion = $state(0);

	let fileInput = $state<HTMLInputElement>();

	function loadFromInput() {
		const target = document.querySelector('input[type=file]');
		if (!target) {
			return;
		}
		// @ts-expect-error we know it's an HTMLInputElement because of the querySelector
		const inputImage: HTMLInputElement = target;
		const filesList = inputImage.files;
		if (!filesList) {
			return;
		}
		const files = [];
		for (let i = 0; i < filesList.length; i += 1) {
			const file = filesList.item(i);
			if (file) {
				files.push(file);
			}
		}
		loadFile(files);
	}

	async function loadFile(files: File[]) {
		const exportedFuizzesWithFailures = await Promise.all(
			files.map(async (file) => {
				if (file.name.endsWith('.zip')) {
					return await loadZip(file);
				} else {
					return await loadSingleToml(file);
				}
			})
		);

		await Promise.all(
			exportedFuizzesWithFailures.filter(isNotUndefined).map(async (config) => {
				const idedConfig = addIds(config);

				const fuiz = {
					config: idedConfig,
					uniqueId: generateUuid(),
					versionId: 0,
					lastEdited: Date.now()
				};

				const id = await addCreation(
					{
						config: removeIds(fuiz.config),
						uniqueId: fuiz.uniqueId,
						versionId: fuiz.versionId,
						lastEdited: fuiz.lastEdited
					},
					db
				);

				creations = [
					...creations,
					{
						id,
						lastEdited: fuiz.lastEdited,
						title: idedConfig.title,
						slidesCount: idedConfig.slides.length,
						media: idedConfig.slides.reduce<Media | undefined>(
							(p, c) => p || getMedia(c),
							undefined
						)
					}
				];
			})
		);
	}

	async function onDownload(id: CreationId) {
		const creation = await getCreation(id, db);
		if (!creation) return;
		const configJson = creation.config;
		await downloadFuiz(configJson);
	}

	async function onShare(id: CreationId, showCopied: () => void) {
		const creation = await getCreation(id, db);
		if (creation) {
			await shareAndCopyURL(creation.config);
		}
		showCopied();
	}
</script>

<TypicalPage>
	<div
		style:display="flex"
		style:justify-content="center"
		style:gap="0.5em"
		style:flex-wrap="wrap"
		style:padding="0 0.5em"
	>
		<div>
			<FancyButton onclick={newCreation}>
				<div
					style:display="flex"
					style:align-items="center"
					style:font-family="var(--alternative-font)"
					style:gap="0.2em"
					style:padding="0.15em 0.25em"
					style:justify-content="center"
				>
					<NoteAddOutline height="1.25em" title={m.start_blank()} />
					<div>{m.start_blank()}</div>
				</div>
			</FancyButton>
		</div>
		<div>
			<input
				bind:this={fileInput}
				style:display="none"
				type="file"
				id="config"
				accept="application/toml, .toml, application/x-zip, .zip"
				name="config"
				multiple
				onchange={() => loadFromInput()}
			/>
			<FancyButton onclick={() => fileInput?.click()}>
				<div
					style:display="flex"
					style:align-items="center"
					style:font-family="var(--alternative-font)"
					style:gap="0.2em"
					style:padding="0.15em 0.25em"
					style:justify-content="center"
				>
					<FileOpenOutline height="1.25em" title={m.open_file()} />
					<div>{m.open_file()}</div>
				</div>
			</FancyButton>
		</div>
		{#each db.availableProviders as { provider } (provider.name)}
			{#if db.remote?.name === provider.name}
				<div>
					<FancyButton onclick={() => db.remote?.logout()}>
						<div
							style:display="flex"
							style:align-items="center"
							style:font-family="var(--alternative-font)"
							style:gap="0.2em"
							style:padding="0.15em 0.25em"
							style:justify-content="center"
						>
							<Logout height="1.25em" title={m.log_out()} />
							<div>{m.log_out()}</div>
						</div>
					</FancyButton>
				</div>
			{:else}
				<div>
					<FancyButton
						onclick={() => provider.login(window.location.pathname + window.location.search)}
					>
						<div
							style:display="flex"
							style:align-items="center"
							style:font-family="var(--alternative-font)"
							style:gap="0.2em"
							style:padding="0.15em 0.25em"
							style:justify-content="center"
						>
							<Login height="1.25em" title={m.backup_to({ provider: provider.displayName })} />
							<div>{m.backup_to({ provider: provider.displayName })}</div>
						</div>
					</FancyButton>
				</div>
			{/if}
		{/each}
	</div>
	<div style:margin="0 0.4em">
		<div
			style:max-width="60ch"
			style:padding="0.5em"
			style:box-sizing="border-box"
			style:margin="1em auto"
			style:background="color-mix(in srgb, currentColor 20%, transparent)"
			style:border="0.1em solid color-mix(in srgb, currentColor 80%, transparent)"
			style:border-radius="0.7em"
		>
			<h2
				style:font-family="var(--alternative-font)"
				style:line-height="1"
				style:margin="0 0 0.2em"
				style:border-bottom="0.05em solid color-mix(in srgb, currentColor 80%, transparent)"
			>
				{m.recent_fuizzes()}
			</h2>
			{#if sortedCreations.length}
				<div
					style:display="grid"
					style:grid-template-columns="repeat(auto-fit, minmax(12ch, 1fr))"
					style:grid-auto-rows="1fr"
					style:grid-gap="0.4em"
				>
					{#each sortedCreations as { id, title, lastEdited, slidesCount, media } (id)}
						<GalleryCreation
							{id}
							{title}
							{lastEdited}
							{slidesCount}
							{media}
							{showShare}
							ondelete={() => {
								selectedToDeletion = id;
								deleteDialog?.open();
							}}
							onplay={() => goto(resolve(localizeHref('/host?id=' + id)))}
							ondownload={() => onDownload(id)}
							onshare={(e) => onShare(id, e)}
						/>
					{/each}
				</div>
			{:else}
				<div
					style:display="flex"
					style:flex-direction="column"
					style:align-items="center"
					style:opacity="0.3"
				>
					<GhostIcon height="min(20vh, 60vw)" width="min(20vh, 60vw)" title={m.nothing()} />
					{m.nothing()}
				</div>
			{/if}
		</div>
	</div>
</TypicalPage>

<ConfirmationDialog
	bind:this={deleteDialog}
	title={m.delete_forever()}
	message=""
	confirmText={m.delete_confirm()}
	onConfirm={() => deleteSlide(selectedToDeletion)}
/>
