<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		addIds,
		downloadFuiz,
		downloadFuizzes,
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
		getCreation,
		type InternalReport,
		type ReportId
	} from '$lib/storage';
	import { type Creation, getMedia, type Media } from '$lib/types';
	import IconButton from '$lib/ui/IconButton.svelte';
	import { isNotUndefined, toSorted } from '$lib/util';
	import BackupOutline from '~icons/material-symbols/backup-outline';
	import Close from '~icons/material-symbols/close';
	import CloudDoneOutline from '~icons/material-symbols/cloud-done-outline';
	import CloudSyncOutline from '~icons/material-symbols/cloud-sync-outline';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import Download from '~icons/material-symbols/download';
	import FolderOpenOutline from '~icons/material-symbols/folder-open-outline';
	import NoteAddOutline from '~icons/material-symbols/note-add-outline';
	import Refresh from '~icons/material-symbols/refresh';
	import SelectAllIcon from '~icons/material-symbols/select-all';
	import GalleryCreation from './GalleryCreation.svelte';

	let {
		creations = $bindable(),
		pendingCreations = $bindable(),
		reports = [],
		syncing = false,
		db,
		showShare
	}: {
		creations: Creation[];
		pendingCreations?: Creation[];
		reports?: [ReportId, InternalReport][];
		syncing?: boolean;
		db: Database;
		showShare?: boolean;
	} = $props();

	/** How many saved reports each quiz has, keyed by the quiz's `uniqueId`. */
	let reportCounts = $derived(
		reports.reduce((counts, [, report]) => {
			if (report.fuizUniqueId) {
				counts.set(report.fuizUniqueId, (counts.get(report.fuizUniqueId) ?? 0) + 1);
			}
			return counts;
		}, new Map<string, number>())
	);

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
				uniqueId: newSlide.uniqueId,
				lastEdited: newSlide.lastEdited,
				title: newSlide.config.title,
				slidesCount: newSlide.config.slides.length
			}
		];

		await goto(resolve(localizeHref(`/quiz/${id}/edit`)));
	}

	async function deleteSlide(id: number) {
		await deleteCreation(id, db);
		creations = creations.filter((c) => c.id !== id);
		selected = selected.filter((s) => s !== id);
	}

	let deleteDialog = $state<ConfirmationDialog>();
	let selectedToDeletion = $state(0);

	let selected = $state<CreationId[]>([]);
	let selecting = $derived(selected.length > 0);

	function toggle(id: CreationId) {
		selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
	}

	let allSelected = $derived(creations.length > 0 && selected.length === creations.length);

	function selectAll() {
		selected = creations.map((c) => c.id);
	}

	let bulkDeleteDialog = $state<ConfirmationDialog>();

	async function deleteSelected() {
		const ids = selected;
		selected = [];
		await Promise.all(ids.map((id) => deleteCreation(id, db)));
		creations = creations.filter((c) => !ids.includes(c.id));
	}

	/** One archive rather than a burst of downloads, which browsers throttle or drop. */
	async function downloadSelected() {
		const creationsToExport = (await Promise.all(selected.map((id) => getCreation(id, db)))).filter(
			isNotUndefined
		);
		if (creationsToExport.length === 0) return;
		await downloadFuizzes(creationsToExport.map((c) => c.config));
		selected = [];
	}

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
						uniqueId: fuiz.uniqueId,
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

		<!-- Stays mounted so the browser has two heights to interpolate between. -->
		<div class="selbar-wrap" class:open={selecting} inert={!selecting}>
			<div class="selbar">
				<button class="clear" onclick={() => (selected = [])}>
					<Close height="1.1em" />
					<span>{m.clear_selection()}</span>
				</button>
				<span class="count">{m.selected_count({ count: selected.length })}</span>
				{#if !allSelected}
					<button class="clear" onclick={selectAll}>
						<SelectAllIcon height="1.1em" />
						<span>{m.select_all()}</span>
					</button>
				{/if}
				<div class="selactions">
					<IconButton alt={m.download()} padding="0.35em" onclick={downloadSelected}>
						<Download />
					</IconButton>
					<IconButton
						alt={m.delete_confirm()}
						padding="0.35em"
						onclick={() => bulkDeleteDialog?.open()}
					>
						<DeleteOutline />
					</IconButton>
				</div>
			</div>
		</div>

		<section class="recent">
			<div class="recent-header">
				<h2>{m.recent_fuizzes()}</h2>
				<div class="actions">
					{#if reports.length}
						<!-- Reports live on each quiz's own page; this catches the ones whose quiz was
						     deleted or that were joined by code. -->
						<a class="all-reports" href={resolve(localizeHref('/reports'))}>{m.all_reports()}</a>
					{/if}
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
					{#each sortedCreations as { id, uniqueId, title, lastEdited, slidesCount, media } (id)}
						<GalleryCreation
							{id}
							{title}
							{lastEdited}
							{slidesCount}
							{media}
							{showShare}
							{selecting}
							selected={selected.includes(id)}
							ontoggle={() => toggle(id)}
							reportCount={reportCounts.get(uniqueId) ?? 0}
							ondelete={() => {
								selectedToDeletion = id;
								deleteDialog?.open();
							}}
							onplay={() => goto(resolve(localizeHref(`/quiz/${id}/host`)))}
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
	bind:this={bulkDeleteDialog}
	title={m.delete_forever()}
	message={m.delete_selected_message({ count: selected.length })}
	confirmText={m.delete_confirm()}
	onConfirm={deleteSelected}
/>

<ConfirmationDialog
	bind:this={logoutDialog}
	title={m.log_out_confirm_title()}
	message={m.log_out_confirm_message()}
	confirmText={m.log_out()}
	onConfirm={() => db.remote?.logout()}
/>

<style>
	/*
	 * `interpolate-size` lets `height: auto` interpolate, so the browser animates the
	 * layout itself rather than stepping height from JS every frame. Without support
	 * the height snaps, which is exactly the un-animated behaviour, so it degrades
	 * cleanly.
	 *
	 * The wrapper carries `position: sticky`, not `.selbar`: sticky does not work inside
	 * an `overflow: hidden` ancestor, and the clipping is what hides the collapsed bar.
	 */
	.selbar-wrap {
		interpolate-size: allow-keywords;
		position: sticky;
		top: 0.4em;
		z-index: 5;
		height: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			height 200ms ease,
			opacity 140ms ease;
	}

	.selbar-wrap.open {
		height: auto;
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.selbar-wrap {
			transition: none;
		}
	}

	.selbar {
		display: flex;
		align-items: center;
		gap: 0.6em;
		background: var(--primary);
		color: var(--on-primary);
		border-radius: 0.6em;
		padding: 0.35em 0.5em;
		margin-bottom: 0.6em;
	}

	.clear {
		display: flex;
		align-items: center;
		gap: 0.3em;
		font: inherit;
		font-weight: 700;
		font-size: 0.85em;
		color: inherit;
		background: none;
		border: none;
		border-radius: 0.4em;
		padding: 0.25em 0.35em;
		cursor: pointer;
	}

	.clear:where(:hover, :focus-visible) {
		background: color-mix(in srgb, var(--on-primary) 18%, transparent);
	}

	.count {
		flex: 1;
		font-size: 0.8em;
		opacity: 0.85;
		font-variant-numeric: tabular-nums;
	}

	.selactions {
		display: flex;
		gap: 0.15em;
	}

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

	.all-reports {
		font-size: 0.8em;
		color: inherit;
		opacity: 0.7;
		white-space: nowrap;
		margin-right: 0.2em;
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
