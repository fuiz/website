<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Loading from '$lib/feedback/Loading.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { addCreation, generateUuid, loadDatabase } from '$lib/storage';

	let { data } = $props();

	onMount(async () => {
		const db = await loadDatabase();

		const id = await addCreation(
			{ lastEdited: Date.now(), uniqueId: generateUuid(), versionId: 0, config: data.fuiz },
			db
		);

		await goto(resolve(localizeHref('/create') + '?id=' + id.toString()));
	});
</script>

<Loading />
