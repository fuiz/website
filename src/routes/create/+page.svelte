<script>
	import * as m from '$lib/paraglide/messages.js';

	import { page } from '$app/state';
	import Editor from './Editor.svelte';
	import Loading from '$lib/Loading.svelte';
	import ErrorPage from '$lib/ErrorPage.svelte';
	import Gallery from './Gallery.svelte';
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import { getAllCreations, getCreation, loadDatabase } from '$lib/storage';
	import { addIds } from '$lib';
	import { localizeHref } from '$lib/paraglide/runtime';

	/** @type {
	 * | 'loading'
	 * | {
	 * 		creation: 'failure' | { id: number; exportedFuiz: import('$lib/storage').ExportedFuiz; config: import('$lib/types').FuizConfig };
	 * 		db: import('$lib/storage').Database;
	 *   }
	 * | { creations: import('$lib/types').Creation[]; db: import('$lib/storage').Database }
	 * } */
	let status = $state('loading');

	/**
	 * @param {string | null} idParam
	 */
	async function getStatus(idParam) {
		const db = await loadDatabase();
		if (idParam) {
			const id = parseInt(idParam);
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

	let { data } = $props();

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
	<Gallery creations={status.creations} db={status.db} {data} />
{:else if status.creation === 'failure'}
	<ErrorPage errorMessage={m.missing_fuiz()} />
{:else}
	<Editor
		bind:id={status.creation.id}
		bind:exportedFuiz={status.creation.exportedFuiz}
		bind:config={status.creation.config}
		db={status.db}
	/>
{/if}
