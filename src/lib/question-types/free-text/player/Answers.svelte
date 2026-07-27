<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { FreeTextMode, Media } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Add from '~icons/material-symbols/add';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		questionText,
		name,
		score,
		media,
		mode,
		maxEntries,
		maxEntryLength,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: Media | undefined;
		mode: FreeTextMode;
		maxEntries: number;
		maxEntryLength: number;
		showAnswers: boolean;
		onanswer: (entries: string[]) => void;
	} = $props();

	let entries = $state<string[]>(['']);

	let filled = $derived(entries.map((entry) => entry.trim()).filter((entry) => entry.length > 0));

	function submit() {
		if (filled.length === 0) return;
		onanswer(filled);
	}
</script>

<PlayerLayout {name} {score}>
	{#snippet belowTopbar()}
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	{/snippet}
	<div class="stack">
		{#if media && showAnswers}
			<div class="media">
				<MediaContainer {media} fit="contain" showFallback={false} />
			</div>
		{/if}
		<form
			class="content"
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			{#each entries as _entry, index (index)}
				<div class="entry-row">
					<Textfield
						id="entry_{index}"
						placeholder={mode === 'WordCloud' ? m.one_word() : m.your_answer()}
						required={false}
						disabled={false}
						maxLength={maxEntryLength}
						bind:value={entries[index]}
					/>
					{#if entries.length > 1}
						<IconButton
							alt={m.delete_answer()}
							onclick={() => (entries = entries.filter((_, i) => i !== index))}
						>
							<DeleteOutline height="1.25em" />
						</IconButton>
					{/if}
				</div>
			{/each}

			{#if entries.length < maxEntries}
				<button type="button" class="add" onclick={() => (entries = [...entries, ''])}>
					<Add height="1em" />
					{m.add_another()}
				</button>
			{/if}

			<FancyButton disabled={filled.length === 0} onclick={submit}>
				<div class="submit">{m.submit()}</div>
			</FancyButton>
		</form>
	</div>
</PlayerLayout>

<style>
	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.media {
		height: 30dvh;
		position: relative;
	}

	.content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.6em;
		padding: 1.2em;
		overflow-y: auto;
	}

	.entry-row {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.entry-row > :global(div) {
		flex: 1;
		min-width: 0;
	}

	.add {
		appearance: none;
		background: none;
		border: 1px dashed color-mix(in srgb, currentColor 40%, transparent);
		border-radius: 0.5em;
		color: inherit;
		font: inherit;
		font-size: 0.9em;
		padding: 0.4em;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3em;
	}

	.add:where(:hover, :focus-visible) {
		border-color: var(--primary);
		color: var(--primary);
		outline: none;
	}

	.submit {
		padding: 0.2em 0.6em;
	}
</style>
