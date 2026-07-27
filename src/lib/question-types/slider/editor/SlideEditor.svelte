<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import SliderTrack from '$lib/game/SliderTrack.svelte';
	import { formatSliderValue } from '$lib/game/sliderFormat';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { SliderSlide } from '$lib/types';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';

	let {
		slide = $bindable()
	}: {
		slide: SliderSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;

	/**
	 * Numbers are edited as text so a half-typed value like "-" or "1." doesn't
	 * get coerced to something surprising mid-keystroke; the slide only takes the
	 * value once it parses.
	 */
	function parse(text: string, apply: (value: number) => void) {
		const parsed = Number(text);
		if (text.trim() !== '' && Number.isFinite(parsed)) apply(parsed);
	}

	// The preview only makes sense on a range that actually spans something.
	let usableRange = $derived(slide.range.max > slide.range.min && slide.range.step > 0);

	let stops = $derived(
		usableRange ? Math.floor((slide.range.max - slide.range.min) / slide.range.step) + 1 : 0
	);
	let tooManyStops = $derived(stops > limits.fuiz.slider.maxSteps);
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
			maxLength={limits.fuiz.slider.maxTitleLength}
		/>
	{/snippet}

	<div class="editor">
		{#if usableRange}
			<div class="preview">
				<SliderTrack
					range={slide.range}
					unit={slide.unit ?? undefined}
					correct={slide.correct}
					tolerance={slide.tolerance}
				/>
			</div>
		{/if}

		<div class="fields">
			<label class="field">
				<span class="field-label">{m.minimum()}</span>
				<Textfield
					id="slider_min"
					placeholder={m.minimum()}
					required={false}
					disabled={false}
					inputmode="decimal"
					bind:value={
						() => String(slide.range.min),
						(text) => parse(text, (value) => (slide.range.min = value))
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.maximum()}</span>
				<Textfield
					id="slider_max"
					placeholder={m.maximum()}
					required={false}
					disabled={false}
					inputmode="decimal"
					bind:value={
						() => String(slide.range.max),
						(text) => parse(text, (value) => (slide.range.max = value))
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.step_size()}</span>
				<Textfield
					id="slider_step"
					placeholder={m.step_size()}
					required={false}
					disabled={false}
					inputmode="decimal"
					bind:value={
						() => String(slide.range.step),
						(text) => parse(text, (value) => (slide.range.step = value > 0 ? value : slide.range.step))
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.unit()}</span>
				<Textfield
					id="slider_unit"
					placeholder={m.unit_placeholder()}
					required={false}
					disabled={false}
					maxLength={limits.fuiz.slider.maxUnitLength}
					bind:value={
						() => slide.unit ?? '',
						(value) => (slide.unit = value.length ? value : undefined)
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.correct_answer()}</span>
				<Textfield
					id="slider_correct"
					placeholder={m.correct_answer()}
					required={false}
					disabled={false}
					inputmode="decimal"
					bind:value={
						() => String(slide.correct),
						(text) => parse(text, (value) => (slide.correct = value))
					}
				/>
			</label>
			<label class="field">
				<span class="field-label">{m.tolerance()}</span>
				<Textfield
					id="slider_tolerance"
					placeholder={m.tolerance()}
					required={false}
					disabled={false}
					inputmode="decimal"
					bind:value={
						() => String(slide.tolerance),
						(text) => parse(text, (value) => (slide.tolerance = Math.max(0, value)))
					}
				/>
			</label>
		</div>

		{#if !usableRange}
			<p class="warn">{m.empty_range()}</p>
		{:else if tooManyStops}
			<p class="warn">{m.too_many_stops({ count: limits.fuiz.slider.maxSteps })}</p>
		{:else if slide.correct < slide.range.min || slide.correct > slide.range.max}
			<p class="warn">{m.correct_out_of_range()}</p>
		{:else}
			<p class="hint">
				{m.slider_accepts({
					from: formatSliderValue(
						slide.correct - slide.tolerance,
						slide.range,
						slide.unit ?? undefined
					),
					to: formatSliderValue(
						slide.correct + slide.tolerance,
						slide.range,
						slide.unit ?? undefined
					)
				})}
			</p>
		{/if}
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
		padding: 0 0.5em;
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

	.hint,
	.warn {
		margin: 0;
		text-align: center;
		font-size: 0.85em;
	}

	.hint {
		opacity: 0.7;
	}

	.warn {
		color: var(--error, #b3261e);
		font-weight: 600;
	}
</style>
