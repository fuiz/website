<script>
	import { onMount } from 'svelte';
	import { addCreation, generateUuid, loadDatabase } from '$lib/storage';
	import { goto } from '$app/navigation';
	import Loading from '$lib/Loading.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();

	onMount(async () => {
		const db = await loadDatabase();

		const id = await addCreation(
			{ lastEdited: Date.now(), uniqueId: generateUuid(), versionId: 0, config: data.fuiz },
			db
		);

		await goto(localizeHref('/create') + '?id=' + id.toString());
	});
</script>

<Loading />
