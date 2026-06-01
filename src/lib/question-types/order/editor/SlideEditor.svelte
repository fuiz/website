<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { OrderSlide } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Textbox from '$lib/ui/Textbox.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Add from '~icons/material-symbols/add';
	import ArrowDownward from '~icons/material-symbols/arrow-downward';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		slide = $bindable()
	}: {
		slide: OrderSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;
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
			maxLength={limits.fuiz.typeAnswer.maxTitleLength}
		/>
	{/snippet}
	<div class="answers">
		<Textfield
			id="from"
			placeholder={m.from()}
			disabled={false}
			required={false}
			bind:value={slide.axis_labels.from}
		/>
		{#each slide.answers as answer, index (answer.id)}
			<div class="answer-row">
				{#if index < slide.answers.length - 1}
					<IconButton
						alt={m.move_down()}
						onclick={() => {
							if (index < slide.answers.length - 1) {
								const temp = slide.answers[index];
								slide.answers[index] = slide.answers[index + 1];
								slide.answers[index + 1] = temp;
							}
						}}
					>
						<ArrowDownward height="1.25em" />
					</IconButton>
				{:else if slide.answers.length < limits.fuiz.order.maxAnswerCount}
					<IconButton
						alt={m.add_answer()}
						onclick={() => {
							slide.answers = [...slide.answers, { text: '', id: Date.now() }];
						}}
					>
						<Add height="1.25em" />
					</IconButton>
				{/if}
				<FancyButton palette={index} active={false}>
					<Textbox
						bind:value={slide.answers[index].text}
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
		{#if slide.answers.length === 0}
			<FancyButton
				onclick={() => {
					slide.answers = [...slide.answers, { text: '', id: Date.now() }];
				}}
			>
				<div class="add-label">{m.add_answer()}</div>
			</FancyButton>
		{/if}

		<Textfield
			id="to"
			placeholder="To"
			disabled={false}
			required={false}
			bind:value={slide.axis_labels.to}
		/>
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
</style>
