<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import { addIds } from '$lib/clientOnly';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import {
		type Database,
		type ExportedFuiz,
		getAllCreations,
		getCreation,
		loadDatabase
	} from '$lib/storage';
	import type { Base64Media, Creation, GenericFuizConfig } from '$lib/types';
	import Editor from './Editor.svelte';
	import Gallery from './Gallery.svelte';

	let { data } = $props();

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
		| { creations: Creation[]; db: Database }
	>('loading');

	async function getStatus(idParam: string | null) {
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
			const creations = await getAllCreations(db);
			status = { creations, db };
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
	<link rel="canonical" href={localizeHref(`${PUBLIC_PLAY_URL}/create`)} />
</svelte:head>

{#if status === 'loading'}
	<Loading />
{:else if 'creations' in status}
	<Gallery creations={status.creations} db={status.db} showShare={data.showShare} />
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
