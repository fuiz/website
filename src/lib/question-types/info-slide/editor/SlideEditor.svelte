<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { InfoSlide } from '$lib/types';
	import Textarea from '$lib/ui/Textarea.svelte';

	let {
		slide = $bindable()
	}: {
		slide: InfoSlide;
	} = $props();

	if (slide.duration != null && slide.duration < 1000) slide.duration *= 1000;
</script>

<SlideEditorLayout>
	{#snippet media()}
		<MediaChooser bind:media={slide.media} />
	{/snippet}
	{#snippet title()}
		<Textarea
			bind:value={slide.title}
			placeholder={m.slide_heading()}
			id="question_title"
			required={false}
			disabled={false}
			maxHeight="4em"
			maxLength={limits.fuiz.infoSlide.maxTitleLength}
		/>
	{/snippet}

	<div class="editor">
		<label class="field">
			<span class="field-label">{m.slide_body()}</span>
			<textarea
				id="info_body"
				placeholder={m.slide_body_placeholder()}
				maxlength={limits.fuiz.infoSlide.maxBodyLength}
				rows="5"
				bind:value={
					() => slide.body ?? '',
					(value: string) => (slide.body = value.length ? value : undefined)
				}
			></textarea>
		</label>
		<p class="hint">{m.info_slide_note()}</p>
	</div>
</SlideEditorLayout>

<style>
	.editor {
		width: 100%;
		max-width: 34em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin-bottom: 0.5em;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	.field-label {
		font-size: 0.8em;
		font-family: var(--alternative-font);
		opacity: 0.75;
	}

	textarea {
		font: inherit;
		color: inherit;
		background: var(--surface-variant);
		border: 1px solid var(--outline);
		border-radius: 0.4em;
		padding: 0.5em;
		resize: vertical;
		width: 100%;
		box-sizing: border-box;
	}

	textarea:focus-visible {
		outline: 2px solid var(--primary);
		border-color: var(--primary);
	}

	.hint {
		margin: 0;
		text-align: center;
		font-size: 0.85em;
		opacity: 0.7;
	}
</style>
