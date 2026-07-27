<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { FreeTextSlide } from '$lib/types';
	import Textarea from '$lib/ui/Textarea.svelte';

	let {
		slide = $bindable()
	}: {
		slide: FreeTextSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;

	let isCloud = $derived(slide.mode === 'WordCloud');
</script>

<SlideEditorLayout>
	{#snippet media()}
		<MediaChooser bind:media={slide.media} />
	{/snippet}
	{#snippet title()}
		<Textarea
			bind:value={slide.title}
			placeholder={m.question_text()}
			id="question_title"
			required={false}
			disabled={false}
			maxHeight="4em"
			maxLength={limits.fuiz.freeText.maxTitleLength}
		/>
	{/snippet}

	<div class="editor">
		<div class="mock" class:cloud={isCloud}>
			{#if isCloud}
				<!-- Word-shaped blanks rather than sample words: the mock has to
				     read the same in every language. -->
				<span class="mock-word big"></span>
				<span class="mock-word"></span>
				<span class="mock-word mid"></span>
				<span class="mock-word"></span>
			{:else}
				<span class="mock-line"></span>
				<span class="mock-line short"></span>
			{/if}
		</div>
		<p class="hint">
			{isCloud
				? m.word_cloud_editor_hint({ count: slide.max_entries })
				: m.open_ended_editor_hint()}
		</p>
		<p class="note">{m.opinion_no_correct()}</p>
	</div>
</SlideEditorLayout>

<style>
	.editor {
		width: 100%;
		max-width: 30em;
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		margin-bottom: 0.5em;
	}

	.mock {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		padding: 1em;
		border: 1px dashed color-mix(in srgb, var(--on-surface) 25%, transparent);
		border-radius: 0.6em;
		min-height: 4em;
		justify-content: center;
	}

	.mock.cloud {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.3em 0.6em;
	}

	.mock-word {
		width: 3.2em;
		height: 0.7em;
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 25%, transparent);
	}

	.mock-word.big {
		width: 4.5em;
		height: 1.1em;
		background: color-mix(in srgb, var(--on-surface) 40%, transparent);
	}

	.mock-word.mid {
		width: 3.8em;
		height: 0.9em;
		background: color-mix(in srgb, var(--on-surface) 32%, transparent);
	}

	.mock-line {
		height: 0.7em;
		border-radius: 1em;
		background: color-mix(in srgb, var(--on-surface) 15%, transparent);
	}

	.mock-line.short {
		width: 60%;
	}

	.hint,
	.note {
		margin: 0;
		text-align: center;
		font-size: 0.85em;
		opacity: 0.7;
	}

	.note {
		font-style: italic;
		font-size: 0.8em;
		opacity: 0.6;
	}
</style>
