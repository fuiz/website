<script>
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import Listing from './Listing.svelte';

	/** @type {{data: import('./$types').PageServerData;}} */
	let { data } = $props();
</script>

<TypicalPage>
	<Listing recentlyPublished={data.recentlyPublished} />
</TypicalPage>
