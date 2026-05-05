<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { addIds } from '$lib/clientOnly';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import {
		type Database,
		type ExportedFuiz,
		getCreation,
		getLocalCreations,
		loadDatabase,
		syncRemote
	} from '$lib/storage';
	import type { Base64Media, Creation, GenericFuizConfig } from '$lib/types';
	import Editor from './Editor.svelte';
	import Gallery from './Gallery.svelte';

	let { data } = $props();

	type GalleryStatus = {
		creations: Creation[];
		pendingCreations?: Creation[];
		syncing: boolean;
		db: Database;
	};

	let status = $state<
		| 'loading'
		| {
				creation:
					| 'failure'
					| {
							id: number;
							exportedFuiz: ExportedFuiz;
							config: GenericFuizConfig<Base64Media | undefined>;
					  };
				db: Database;
		  }
		| GalleryStatus
	>('loading');

	let pendingSync: { cancelled: boolean } | undefined;

	function creationsEqual(a: Creation[], b: Creation[]): boolean {
		if (a.length !== b.length) return false;
		const byId = new Map(a.map((c) => [c.id, c]));
		return b.every((c) => {
			const o = byId.get(c.id);
			return (
				!!o &&
				o.lastEdited === c.lastEdited &&
				o.title === c.title &&
				o.slidesCount === c.slidesCount
			);
		});
	}

	async function getStatus(idParam: string | null) {
		if (pendingSync) pendingSync.cancelled = true;
		pendingSync = undefined;

		const db = await loadDatabase();
		if (idParam) {
			const id = parseInt(idParam, 10);
			const exportedFuiz = await getCreation(id, db);
			if (!exportedFuiz) {
				status = { creation: 'failure', db };
				return;
			}
			const config = addIds(exportedFuiz.config);
			status = config
				? { creation: { id, exportedFuiz, config }, db }
				: { creation: 'failure', db };
		} else {
			const creations = await getLocalCreations(db);
			status = {
				creations,
				syncing: !!db.remote,
				db
			};
			if (db.remote) {
				const flag = { cancelled: false };
				pendingSync = flag;
				syncInBackground(db, flag);
			}
		}
	}

	function isGallery(s: typeof status): s is GalleryStatus {
		return s !== 'loading' && 'creations' in s;
	}

	async function syncInBackground(db: Database, flag: { cancelled: boolean }) {
		try {
			await syncRemote(db);
			if (flag.cancelled || !isGallery(status)) return;
			const fresh = await getLocalCreations(db);
			if (flag.cancelled || !isGallery(status)) return;
			if (!creationsEqual(status.creations, fresh)) {
				status.pendingCreations = fresh;
			}
			status.syncing = false;
		} catch {
			if (!flag.cancelled && isGallery(status)) status.syncing = false;
		}
	}

	let creationId = $derived(page.url.searchParams.get('id'));

	$effect(() => {
		getStatus(creationId);
	});

	const title = m.create_title();
	const description = m.create_desc();
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<link rel="canonical" href={localizeHref(`${env.PUBLIC_PLAY_URL}/create`)} />
</svelte:head>

{#if status === 'loading'}
	<Loading />
{:else if 'creations' in status}
	<Gallery
		bind:creations={status.creations}
		bind:pendingCreations={status.pendingCreations}
		syncing={status.syncing}
		db={status.db}
		showShare={data.showShare}
	/>
{:else if status.creation === 'failure'}
	<ErrorPage errorMessage={m.missing_fuiz()} />
{:else}
	<Editor
		bind:id={status.creation.id}
		bind:exportedFuiz={status.creation.exportedFuiz}
		bind:config={status.creation.config}
		db={status.db}
		showPublish={data.showPublish}
		showShare={data.showShare}
	/>
{/if}
