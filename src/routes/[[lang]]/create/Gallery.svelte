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
	import CloudSyncOutline from '~icons/material-symbols/cloud-sync-outline';
	import FolderOpenOutline from '~icons/material-symbols/folder-open-outline';
	import NoteAddOutline from '~icons/material-symbols/note-add-outline';
	import Refresh from '~icons/material-symbols/refresh';
	import GalleryCreation from './GalleryCreation.svelte';

	let {
		creations = $bindable(),
		pendingCreations = $bindable(),
		syncing = false,
		db,
		showShare
	}: {
		creations: Creation[];
		pendingCreations?: Creation[];
		syncing?: boolean;
		db: Database;
		showShare?: boolean;
	} = $props();

	function applyPending() {
		if (!pendingCreations) return;
		creations = pendingCreations;
		pendingCreations = undefined;
	}

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

	let logoutDialog = $state<ConfirmationDialog>();

	let fileInput = $state<HTMLInputElement>();
	let dragDepth = $state(0);

	function loadFromInput() {
		if (!fileInput?.files) return;
		const files: File[] = [];
		for (let i = 0; i < fileInput.files.length; i++) {
			const f = fileInput.files.item(i);
			if (f) files.push(f);
		}
		loadFile(files);
	}

	function isImportableFile(f: File) {
		return f.name.endsWith('.toml') || f.name.endsWith('.zip');
	}

	function onDragEnter(e: DragEvent) {
		if (!e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		dragDepth++;
	}

	function onDragLeave(e: DragEvent) {
		if (!e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		dragDepth = Math.max(0, dragDepth - 1);
	}

	function onDragOver(e: DragEvent) {
		if (!e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}

	function onDrop(e: DragEvent) {
		if (!e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		dragDepth = 0;
		const files = Array.from(e.dataTransfer.files).filter(isImportableFile);
		if (files.length) loadFile(files);
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
		class="hidden-input"
		type="file"
		id="config"
		accept="application/toml, .toml, application/x-zip, .zip"
		name="config"
		multiple
		onchange={loadFromInput}
	/>
	<div
		class="page"
		class:dragging={dragDepth > 0}
		ondragenter={onDragEnter}
		ondragleave={onDragLeave}
		ondragover={onDragOver}
		ondrop={onDrop}
		role="presentation"
	>
		<header class="hero">
			<h1>{m.create_title()}</h1>
			<p class="tagline">{m.create_desc()}</p>
		</header>

		<section class="recent">
			<div class="recent-header">
				<h2>{m.recent_fuizzes()}</h2>
				<div class="actions">
					<IconButton alt={m.start_blank()} onclick={newCreation}>
						<NoteAddOutline />
					</IconButton>
					<IconButton alt={m.open_file()} onclick={() => fileInput?.click()}>
						<FolderOpenOutline />
					</IconButton>
					{#if pendingCreations}
						<IconButton alt={m.refresh_creations()} onclick={applyPending}>
							<Refresh />
						</IconButton>
					{/if}
					{#each db.availableProviders as { provider } (provider.name)}
						{#if db.remote?.name === provider.name}
							{#if syncing}
								<IconButton alt={m.syncing()} disabled>
									<span class="syncing-icon"><CloudSyncOutline /></span>
								</IconButton>
							{:else}
								<IconButton alt={m.log_out()} onclick={() => logoutDialog?.open()}>
									<CloudDoneOutline />
								</IconButton>
							{/if}
						{:else}
							<IconButton
								alt={m.backup_to({ provider: provider.displayName })}
								onclick={() => provider.login(window.location.pathname + window.location.search)}
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
		</section>
	</div>
</TypicalPage>

<ConfirmationDialog
	bind:this={deleteDialog}
	title={m.delete_forever()}
	message=""
	confirmText={m.delete_confirm()}
	onConfirm={() => deleteSlide(selectedToDeletion)}
/>

<ConfirmationDialog
	bind:this={logoutDialog}
	title={m.log_out_confirm_title()}
	message={m.log_out_confirm_message()}
	confirmText={m.log_out()}
	onConfirm={() => db.remote?.logout()}
/>

<style>
	.hidden-input {
		display: none;
	}

	.page {
		position: relative;
		max-width: 90ch;
		margin: 0 auto;
		padding: 0 0.6em 2em;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
		padding: 2em 0 1.5em;
		text-align: center;
	}

	.hero h1 {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: clamp(2em, 5vw, 2.75em);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.tagline {
		margin: 0;
		max-width: 50ch;
		opacity: 0.75;
		line-height: 1.4;
	}

	.recent {
		display: flex;
		flex-direction: column;
		gap: 0.6em;
	}

	.recent-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
	}

	.recent-header h2 {
		font-family: var(--alternative-font);
		font-size: 1em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0;
		opacity: 0.65;
	}

	.actions {
		display: flex;
		gap: 0.4em;
		flex-wrap: wrap;
	}

	.syncing-icon {
		display: inline-flex;
		animation: pulse 1.4s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18ch, 1fr));
		grid-auto-rows: 1fr;
		gap: 0.5em;
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
		font-size: 1.05em;
		color: inherit;
		background: none;
		border: 2px dashed var(--outline);
		border-radius: 0.7em;
		cursor: pointer;
		opacity: 0.7;
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

	.page.dragging .empty {
		opacity: 1;
		border-color: var(--primary);
		background: color-mix(in srgb, var(--primary) 10%, transparent);
	}

	.page.dragging::after {
		content: '';
		position: fixed;
		inset: 0;
		pointer-events: none;
		background: color-mix(in srgb, var(--primary) 8%, transparent);
		border: 0.3em dashed var(--primary);
		border-radius: 0.4em;
		z-index: 1000;
	}
</style>
