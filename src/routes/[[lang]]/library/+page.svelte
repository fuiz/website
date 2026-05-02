<script lang="ts">
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import type { PageServerData } from './$types';
	import Listing from './Listing.svelte';

	let {
		data
	}: {
		data: PageServerData;
	} = $props();
</script>

<TypicalPage>
	<Listing recentlyPublished={data.recentlyPublished} />
</TypicalPage>
