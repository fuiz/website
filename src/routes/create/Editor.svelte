<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { assertUnreachable, fixTimes, removeIds } from '$lib';
	import { updateCreation, type Database, type ExportedFuiz } from '$lib/storage';
	import { debounce } from '$lib/util';
	import Main from './Main.svelte';
	import Topbar from './Topbar.svelte';
	import { share } from './lib';
	import { untrack } from 'svelte';
	import type { Base64Media, GenericFuizConfig } from '$lib/types';

	let {
		id = $bindable(),
		exportedFuiz = $bindable(),
		config = $bindable(),
		db
	}: {
		id: number;
		exportedFuiz: ExportedFuiz;
		config: GenericFuizConfig<Base64Media | undefined>;
		db: Database;
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

	let no_answer = $derived(
		config.slides.filter((s) => {
			switch (true) {
				case 'MultipleChoice' in s:
					return s.MultipleChoice.answers.length == 0;
				case 'TypeAnswer' in s:
					return s.TypeAnswer.answers.length == 0;
				case 'Order' in s:
					return s.Order.answers.length == 0;
				default:
					return assertUnreachable(s);
			}
		}).length > 0
	);

	let no_correct_answer = $derived(
		config.slides.filter((s) => {
			switch (true) {
				case 'MultipleChoice' in s:
					return s.MultipleChoice.answers.filter((s) => s.correct).length == 0;
				case 'TypeAnswer' in s:
					return false;
				case 'Order' in s:
					return false;
				default:
					return assertUnreachable(s);
			}
		}).length > 0
	);

	let empty_answer = $derived(
		config.slides.filter((s) => {
			switch (true) {
				case 'MultipleChoice' in s:
					return s.MultipleChoice.answers.some((a) => !a.content.Text.length);
				case 'TypeAnswer' in s:
					return s.TypeAnswer.answers.some((a) => !a.text.length);
				case 'Order' in s:
					return s.Order.answers.some((a) => !a.text.length);
				default:
					return assertUnreachable(s);
			}
		}).length > 0
	);

	let duplicate_answers = $derived(
		config.slides.filter((s) => {
			switch (true) {
				case 'MultipleChoice' in s:
					return (
						new Set(s.MultipleChoice.answers.map((a) => a.content.Text)).size !==
						s.MultipleChoice.answers.length
					);
				case 'TypeAnswer' in s:
					return (
						new Set(s.TypeAnswer.answers.map((a) => a.text)).size !== s.TypeAnswer.answers.length
					);
				case 'Order' in s:
					return new Set(s.Order.answers.map((a) => a.text)).size !== s.Order.answers.length;
				default:
					return assertUnreachable(s);
			}
		}).length > 0
	);

	async function onShare(e: import('tippy.js').Instance) {
		await share(removeIds(config), undefined);
		e.show();
	}
</script>

<div
	style:min-height="100dvh"
	style:background="var(--background-color)"
	style:display="flex"
	style:flex-direction="column"
>
	<Topbar
		bind:title={config.title}
		{id}
		{db}
		onshare={onShare}
		errorMessage={no_answer
			? m.missing_answers()
			: no_correct_answer
				? m.missing_correct()
				: empty_answer
					? m.empty_answer()
					: duplicate_answers
						? m.duplicate_answers()
						: undefined}
	/>
	<Main bind:config />
</div>
