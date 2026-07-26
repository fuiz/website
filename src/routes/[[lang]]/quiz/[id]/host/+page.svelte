<script lang="ts">
	import { page } from '$app/state';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import Options from './Options.svelte';

	let id = $derived(parseInt(page.params.id ?? '', 10));
</script>

{#if Number.isNaN(id)}
	<ErrorPage errorMessage={m.missing_fuiz()} />
{:else}
	<Options {id} />
{/if}
