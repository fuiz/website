<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import AnswersLayout from '$lib/question-types/host/AnswersLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { FreeTextMode, Media } from '$lib/types';
	import Keyboard from '~icons/material-symbols/keyboard-outline';

	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		mode,
		maxEntries,
		timeLeft,
		timeStarted,
		answeredCount,
		media,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionText: string;
		mode: FreeTextMode;
		maxEntries: number;
		timeLeft: number | null;
		timeStarted: number | null;
		answeredCount: number;
		media: Media | undefined;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();
</script>

<AnswersLayout
	bind:bindableGameInfo
	{gameInfo}
	{questionText}
	{timeLeft}
	{timeStarted}
	{answeredCount}
	{media}
	{onlock}
	{onnext}
>
	<div class="prompt">
		<Keyboard height="2.4em" />
		<div class="text">
			{#if mode === 'WordCloud'}
				{maxEntries > 1 ? m.word_cloud_host_hint({ count: maxEntries }) : m.word_cloud_host_hint_one()}
			{:else}
				{m.open_ended_host_hint()}
			{/if}
		</div>
	</div>
</AnswersLayout>

<style>
	.prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4em;
		padding: 2em 1em 3em;
		opacity: 0.75;
	}

	.text {
		font-size: 1.5em;
		font-family: var(--alternative-font);
		text-align: center;
	}
</style>
