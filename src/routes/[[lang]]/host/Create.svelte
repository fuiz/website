<script lang="ts">
	import { resolve } from '$app/paths';
	import Loading from '$lib/feedback/Loading.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { getAllCreations, loadDatabase } from '$lib/storage';
	import CreationsPicker from '$lib/ui/CreationsPicker.svelte';
</script>

{#await loadDatabase().then((db) => getAllCreations(db))}
	<Loading />
{:then creations}
	<TypicalPage>
		<div class="wrapper">
			{#if creations.length > 0}
				<h2>{m.choose_local()}</h2>
			{/if}
			<CreationsPicker {creations} href={(id) => resolve(localizeHref(`/host?id=${id}`))} />
		</div>
	</TypicalPage>
{/await}

<style>
	.wrapper {
		max-width: 90ch;
		margin: 1em auto;
		padding: 0 0.4em;
	}

	h2 {
		font-family: var(--alternative-font);
		line-height: 1;
		margin: 0 0 0.4em;
		opacity: 0.7;
	}
</style>
