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
	import IconButton from '$lib/ui/IconButton.svelte';
	import { isNotUndefined, toSorted } from '$lib/util';
	import BackupOutline from '~icons/material-symbols/backup-outline';
	import CloudDoneOutline from '~icons/material-symbols/cloud-done-outline';
	import FolderOpenOutline from '~icons/material-symbols/folder-open-outline';
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
	<div class="recent-wrapper">
		<div class="recent">
			<div class="recent-header">
				<h2>{m.recent_fuizzes()}</h2>
				<div class="actions">
					<IconButton alt={m.start_blank()} onclick={newCreation}>
						<NoteAddOutline />
					</IconButton>
					<IconButton alt={m.open_file()} onclick={() => fileInput?.click()}>
						<FolderOpenOutline />
					</IconButton>
					{#each db.availableProviders as { provider } (provider.name)}
						{#if db.remote?.name === provider.name}
							<IconButton alt={m.log_out()} onclick={() => db.remote?.logout()}>
								<CloudDoneOutline />
							</IconButton>
						{:else}
							<IconButton
								alt={m.backup_to({ provider: provider.displayName })}
								onclick={() =>
									provider.login(window.location.pathname + window.location.search)}
							>
								<BackupOutline />
							</IconButton>
						{/if}
					{/each}
				</div>
			</div>
			{#if sortedCreations.length}
				<div class="grid">
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
				<button class="empty" onclick={newCreation}>
					<NoteAddOutline height="min(10vh, 30vw)" width="min(10vh, 30vw)" />
					<span>{m.start_blank()}</span>
				</button>
			{/if}
		</div>
	</div>
</TypicalPage>

<style>
	.recent-wrapper {
		margin: 0 0.4em;
	}

	.recent {
		max-width: 90ch;
		box-sizing: border-box;
		margin: 1em auto;
	}

	.recent-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
		margin: 0 0 0.4em;
	}

	.recent-header h2 {
		font-family: var(--alternative-font);
		line-height: 1;
		margin: 0;
		opacity: 0.7;
	}

	.actions {
		display: flex;
		gap: 0.4em;
		flex-wrap: wrap;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18ch, 1fr));
		grid-auto-rows: 1fr;
		grid-gap: 0.5em;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4em;
		width: 100%;
		padding: 2em 1em;
		box-sizing: border-box;
		font-family: var(--alternative-font);
		font-size: 1.1em;
		color: inherit;
		background: none;
		border: 0.15em dashed color-mix(in srgb, currentColor 30%, transparent);
		border-radius: 0.7em;
		cursor: pointer;
		opacity: 0.6;
		transition:
			opacity 150ms ease-out,
			border-color 150ms ease-out,
			background 150ms ease-out;
	}

	.empty:where(:hover, :focus-visible) {
		opacity: 1;
		border-color: var(--primary);
		background: color-mix(in srgb, var(--primary) 8%, transparent);
		outline: none;
	}
</style>

<ConfirmationDialog
	bind:this={deleteDialog}
	title={m.delete_forever()}
	message=""
	confirmText={m.delete_confirm()}
	onConfirm={() => deleteSlide(selectedToDeletion)}
/>
