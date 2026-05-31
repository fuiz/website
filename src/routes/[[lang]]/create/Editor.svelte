<script lang="ts">
	import { untrack } from 'svelte';

	import { fixTimes, removeIds, shareAndCopyURL } from '$lib/clientOnly';
	import { lintConfig } from '$lib/question-types/lint';
	import { lintIssueTopbarMessage } from '$lib/question-types/lintMessages';
	import { type Database, type ExportedFuiz, updateCreation } from '$lib/storage';
	import type { Base64Media, GenericFuizConfig } from '$lib/types';
	import { debounce } from '$lib/util';
	import Main from './Main.svelte';
	import Topbar from './Topbar.svelte';

	let {
		id = $bindable(),
		exportedFuiz = $bindable(),
		config = $bindable(),
		db,
		showPublish,
		showShare
	}: {
		id: number;
		exportedFuiz: ExportedFuiz;
		config: GenericFuizConfig<Base64Media | undefined>;
		db: Database;
		showPublish?: boolean;
		showShare?: boolean;
	} = $props();

	const updateStorage = debounce(() => {
		exportedFuiz = {
			...exportedFuiz,
			versionId: exportedFuiz.versionId + 1
		};
		updateCreation(
			id,
			{
				...$state.snapshot(exportedFuiz),
				config: fixTimes(removeIds($state.snapshot(config))),
				lastEdited: Date.now()
			},
			db
		);
	}, 500);

	$effect(() => {
		$state.snapshot(config);
		untrack(() => updateStorage());
	});

	let errorMessage = $derived(lintIssueTopbarMessage(lintConfig(config)));

	async function onShare(showCopied: () => void) {
		await shareAndCopyURL(removeIds(config));
		showCopied();
	}
</script>

<div class="root">
	<Topbar
		bind:title={config.title}
		{id}
		{db}
		{showPublish}
		{showShare}
		onshare={onShare}
		{errorMessage}
	/>
	<Main bind:config />
</div>

<style>
	.root {
		min-height: 100dvh;
		background: var(--surface);
		display: flex;
		flex-direction: column;
	}
</style>
