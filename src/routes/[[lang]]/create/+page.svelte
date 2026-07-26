<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Loading from '$lib/feedback/Loading.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import {
		type Database,
		getLocalCreations,
		getLocalReports,
		type InternalReport,
		loadDatabase,
		type ReportId,
		syncRemote,
		syncRemoteReports
	} from '$lib/storage';
	import type { Creation } from '$lib/types';
	import Gallery from './Gallery.svelte';

	let { data } = $props();

	type GalleryStatus = {
		creations: Creation[];
		pendingCreations?: Creation[];
		reports: [ReportId, InternalReport][];
		syncing: boolean;
		db: Database;
	};

	let status = $state<'loading' | GalleryStatus>('loading');

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

	function isGallery(s: typeof status): s is GalleryStatus {
		return s !== 'loading';
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

			// Reports have no in-place editing to interrupt, so they refresh without the
			// pending/apply dance that creations need.
			await syncRemoteReports(db);
			if (flag.cancelled || !isGallery(status)) return;
			status.reports = await getLocalReports(db);

			status.syncing = false;
		} catch {
			if (!flag.cancelled && isGallery(status)) status.syncing = false;
		}
	}

	async function loadGallery() {
		if (pendingSync) pendingSync.cancelled = true;
		pendingSync = undefined;

		const db = await loadDatabase();
		status = {
			creations: await getLocalCreations(db),
			reports: await getLocalReports(db),
			syncing: !!db.remote,
			db
		};

		if (db.remote) {
			const flag = { cancelled: false };
			pendingSync = flag;
			syncInBackground(db, flag);
		}
	}

	$effect(() => {
		loadGallery();
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
{:else}
	<Gallery
		bind:creations={status.creations}
		bind:pendingCreations={status.pendingCreations}
		reports={status.reports}
		syncing={status.syncing}
		db={status.db}
		showShare={data.showShare}
	/>
{/if}
