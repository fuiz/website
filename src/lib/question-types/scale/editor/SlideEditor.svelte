<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import ScalePicker from '$lib/game/ScalePicker.svelte';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { ScaleSlide } from '$lib/types';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';

	let {
		slide = $bindable()
	}: {
		slide: ScaleSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;

	let isNps = $derived(slide.style === 'Nps');

	let points = $derived(
		slide.max >= slide.min
			? Array.from({ length: slide.max - slide.min + 1 }, (_, i) => slide.min + i)
			: []
	);
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
			maxLength={limits.fuiz.scale.maxTitleLength}
		/>
	{/snippet}

	<div class="editor">
		<div class="preview" class:dense={points.length > 7}>
			<ScalePicker {points} labels={slide.labels} style={slide.style} />
		</div>

		<div class="fields">
			<label class="field">
				<span class="field-label">{m.label_low()}</span>
				<Textfield
					id="scale_low"
					placeholder={m.label_low_placeholder()}
					required={false}
					disabled={false}
					maxLength={limits.fuiz.scale.maxLabelLength}
					bind:value={
						() => slide.labels.low ?? '',
						(value) => (slide.labels.low = value.length ? value : undefined)
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.label_mid()}</span>
				<Textfield
					id="scale_mid"
					placeholder={m.label_mid_placeholder()}
					required={false}
					disabled={false}
					maxLength={limits.fuiz.scale.maxLabelLength}
					bind:value={
						() => slide.labels.mid ?? '',
						(value) => (slide.labels.mid = value.length ? value : undefined)
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.label_high()}</span>
				<Textfield
					id="scale_high"
					placeholder={m.label_high_placeholder()}
					required={false}
					disabled={false}
					maxLength={limits.fuiz.scale.maxLabelLength}
					bind:value={
						() => slide.labels.high ?? '',
						(value) => (slide.labels.high = value.length ? value : undefined)
					}
				/>
			</label>
		</div>

		<p class="hint">
			{isNps ? m.nps_editor_hint() : m.scale_editor_hint()}
		</p>
	</div>
</SlideEditorLayout>

<style>
	.editor {
		width: 100%;
		max-width: 34em;
		display: flex;
		flex-direction: column;
		gap: 0.8em;
		margin-bottom: 0.5em;
	}

	.preview {
		padding: 0 0.4em;
	}

	.preview.dense {
		font-size: 0.85em;
	}

	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9em, 1fr));
		gap: 0.5em;
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

	.hint {
		margin: 0;
		text-align: center;
		font-size: 0.85em;
		opacity: 0.7;
	}
</style>
