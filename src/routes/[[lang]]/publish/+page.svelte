<script lang="ts">
	import { resolve } from '$app/paths';

	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import Header from '$lib/layout/Header.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { Database } from '$lib/storage';
	import { getAllCreations, getCreation, loadDatabase } from '$lib/storage';
	import CreationsPicker from '$lib/ui/CreationsPicker.svelte';
	import Publish from './Publish.svelte';

	function parseIntOrNull(str: string | null): number | null {
		if (str === null) {
			return null;
		}
		try {
			return Number.parseInt(str, 10);
		} catch {
			return null;
		}
	}

	let id = $derived(parseIntOrNull(page.url.searchParams.get('id')));
	const title = m.publish_title();
	const description = m.publish_desc();

	async function joinCreation(db: Database, filteredId: number) {
		return { db, creation: await getCreation(filteredId, db) };
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<link rel="canonical" href={localizeHref(`${env.PUBLIC_PLAY_URL}/publish`)} />
</svelte:head>

{#if id}
	{@const filteredId = id}
	{#await loadDatabase().then((db) => joinCreation(db, filteredId))}
		<Loading />
	{:then { creation }}
		{#if creation}
			<Publish {creation} {id} />
		{:else}
			<ErrorMessage errorMessage={m.missing_fuiz()} />
		{/if}
	{/await}
{:else}
	{#await loadDatabase().then((db) => getAllCreations(db))}
		<Loading />
	{:then creations}
		<NiceBackground>
			<div class="page">
				<header class="page-header">
					<Header />
				</header>
				<section>
					{#if creations.length > 0}
						<h2>{m.choose_local()}</h2>
					{/if}
					<CreationsPicker {creations} href={(id) => resolve(localizeHref(`/publish?id=${id}`))} />
				</section>
				<Footer />
			</div>
		</NiceBackground>
	{/await}
{/if}

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5em;
		box-sizing: border-box;
	}

	.page-header {
		margin: 0.5em 0;
	}

	section {
		flex: 1;
		display: flex;
		max-width: 90ch;
		flex-direction: column;
		justify-content: center;
		padding: 0.5em;
		width: 100%;
	}

	h2 {
		font-family: var(--alternative-font);
		line-height: 1;
		margin: 0 0 0.4em;
		opacity: 0.7;
	}
</style>
