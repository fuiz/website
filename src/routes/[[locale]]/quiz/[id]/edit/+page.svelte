<script lang="ts">
	import { page } from '$app/state';
	import { addIds } from '$lib/clientOnly';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		type CreationId,
		type Database,
		type ExportedFuiz,
		getCreation,
		loadDatabase
	} from '$lib/storage';
	import type { Base64Media, GenericFuizConfig } from '$lib/types';
	import Editor from '../../../create/Editor.svelte';

	let { data } = $props();

	let id = $derived(parseInt(page.params.id ?? '', 10));

	type Loaded = {
		id: CreationId;
		exportedFuiz: ExportedFuiz;
		config: GenericFuizConfig<Base64Media | undefined>;
		db: Database;
	};

	let status = $state<'loading' | 'failure' | Loaded>('loading');

	async function load(id: CreationId) {
		if (Number.isNaN(id)) {
			status = 'failure';
			return;
		}
		const db = await loadDatabase();
		const exportedFuiz = await getCreation(id, db);
		if (!exportedFuiz) {
			status = 'failure';
			return;
		}
		const config = addIds(exportedFuiz.config);
		status = config ? { id, exportedFuiz, config, db } : 'failure';
	}

	$effect(() => {
		load(id);
	});
</script>

{#if status === 'loading'}
	<Loading />
{:else if status === 'failure'}
	<ErrorPage errorMessage={m.missing_fuiz()} />
{:else}
	<Editor
		bind:id={status.id}
		bind:exportedFuiz={status.exportedFuiz}
		bind:config={status.config}
		db={status.db}
		showPublish={data.showPublish}
		showShare={data.showShare}
	/>
{/if}
