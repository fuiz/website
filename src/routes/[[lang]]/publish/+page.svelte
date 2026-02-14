<script>
	import { resolve } from '$app/paths';

	import { page } from '$app/state';
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import Header from '$lib/layout/Header.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { getAllCreations, getCreation, loadDatabase } from '$lib/storage';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import { toSorted } from '$lib/util';
	import Publish from './Publish.svelte';

	/**
	 * @param {string | null} str
	 * @returns {number | null}
	 */
	function parseIntOrNull(str) {
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

	/**
	 * @param {import('$lib/storage').Database} db
	 * @param {number} filteredId
	 */
	async function joinCreation(db, filteredId) {
		return { db, creation: await getCreation(filteredId, db) };
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<link rel="canonical" href={localizeHref(`${PUBLIC_PLAY_URL}/publish`)} />
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
		{@const sortedCreations = toSorted(creations, (a, b) => -b.lastEdited - a.lastEdited)}
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:flex-direction="column"
				style:align-items="center"
				style:padding="0.5em"
				style:box-sizing="border-box"
			>
				<header style:margin="0.5em 0">
					<Header />
				</header>
				<section>
					{#if creations.length > 0}
						<h2>{m.choose_local()}</h2>
						<ul id="creations-list">
							{#each sortedCreations as { title, id, slidesCount }, index (id)}
								<li class="creation">
									<a href={resolve(localizeHref(`/publish?id=${id}`))}>
										{title} · {m.slides_count({ count: slidesCount })}
									</a>
								</li>
								{#if index + 1 != creations.length}
									<hr />
								{/if}
							{/each}
						</ul>
					{:else}
						<div>
							<FancyAnchorButton href={resolve(localizeHref('/create'))}>
								<div class="create">{m.create()}</div>
							</FancyAnchorButton>
						</div>
					{/if}
				</section>
				<Footer />
			</div>
		</NiceBackground>
	{/await}
{/if}

<style>
	section {
		flex: 1;
		display: flex;
		max-width: 25ch;
		flex-direction: column;
		justify-content: center;
		padding: 0.5em;
		width: 100%;
	}

	#creations-list {
		display: flex;
		flex-direction: column;
		border: 0.2em solid;
		border-radius: 0.5em;
		padding: 0;
		margin: 0;
	}

	.creation {
		display: flex;
	}

	hr {
		appearance: none;
		width: 100%;
		color: inherit;
		border-top: 0.2em solid;
		margin: 0;
	}

	h2 {
		margin: 0 0 0.5em;
		font-size: 1.25em;
	}

	.creation a {
		flex: 1;
		text-decoration: inherit;
		color: inherit;
		padding: 0.4em;
		margin: 0;
	}

	.create {
		font-family: var(--alternative-font);
		text-align: center;
	}
</style>
