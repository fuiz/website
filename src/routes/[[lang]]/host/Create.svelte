<script>
	import * as m from '$lib/paraglide/messages.js';

	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import { getAllCreations, loadDatabase } from '$lib/storage';
	import { toSorted } from '$lib/util';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { resolve } from '$app/paths';
</script>

{#await loadDatabase().then((db) => getAllCreations(db))}
	<Loading />
{:then creations}
	{@const sortedCreations = toSorted(creations, (a, b) => -b.lastEdited - a.lastEdited)}
	<TypicalPage>
		<div style:max-width="25ch" style:margin="auto">
			{#if creations.length > 0}
				<h2>{m.choose_local()}</h2>
				<ul id="creations-list">
					{#each sortedCreations as { title, id, slidesCount }, index (id)}
						<li class="creation">
							<a href={resolve(localizeHref(`/host?id=${id}`))}>{title} · {slidesCount} slides</a>
						</li>
						{#if index + 1 != creations.length}
							<hr />
						{/if}
					{/each}
				</ul>
			{:else}
				<div>
					<FancyAnchorButton href={localizeHref('/create')}>
						<div class="create">{m.create()}</div>
					</FancyAnchorButton>
				</div>
			{/if}
		</div>
	</TypicalPage>
{/await}

<style>
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
		font-family: Poppins;
		text-align: center;
	}
</style>
