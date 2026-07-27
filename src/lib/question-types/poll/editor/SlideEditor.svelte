<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { PollSlide } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Textbox from '$lib/ui/Textbox.svelte';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		slide = $bindable()
	}: {
		slide: PollSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;

	function addOption() {
		slide.answers = [...slide.answers, { content: { Text: '' }, id: Date.now() }];
	}
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
			maxLength={limits.fuiz.poll.maxTitleLength}
		/>
	{/snippet}

	<div class="answers">
		{#each slide.answers as answer, index (answer.id)}
			<div class="answer-row">
				<FancyButton palette={index} active={false}>
					<Textbox
						bind:value={slide.answers[index].content.Text}
						placeholder={m.answer_text()}
						textAlign="start"
						lightText
						maxLength={limits.fuiz.maxAnswerTextLength}
					/>
				</FancyButton>
				<IconButton
					alt={m.delete_answer()}
					onclick={() => {
						slide.answers = slide.answers.filter((a) => a.id !== answer.id);
					}}
				>
					<DeleteOutline height="1.25em" />
				</IconButton>
			</div>
		{/each}

		{#if slide.answers.length < limits.fuiz.poll.maxAnswerCount}
			<FancyButton onclick={addOption}>
				<div class="add-label">{m.add_answer()}</div>
			</FancyButton>
		{/if}

		<p class="note">{m.opinion_no_correct()}</p>
	</div>
</SlideEditorLayout>

<style>
	.answers {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin: 0.5em 0;
		max-width: 30ch;
		width: 100%;
	}

	.answer-row {
		display: flex;
		gap: 0.5em;
		align-items: center;
	}

	.add-label {
		padding: 0.2em 0.6em;
	}

	.note {
		margin: 0;
		text-align: center;
		font-size: 0.8em;
		font-style: italic;
		opacity: 0.65;
	}
</style>
