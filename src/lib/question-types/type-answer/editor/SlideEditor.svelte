<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { TypeAnswer } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		slide = $bindable()
	}: {
		slide: TypeAnswer;
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
		{#each slide.answers as answer (answer.id)}
			<div class="answer-row">
				<Textfield
					bind:value={answer.text}
					placeholder={m.answer_text()}
					id="answer_text"
					required={false}
					disabled={false}
					maxLength={limits.fuiz.maxAnswerTextLength}
				/>
				<IconButton
					alt={m.delete_answer()}
					onclick={() => (slide.answers = slide.answers.filter((a) => a.id !== answer.id))}
				>
					<DeleteOutline height="1.5em" />
				</IconButton>
			</div>
		{/each}
		{#if slide.answers.length < limits.fuiz.typeAnswer.maxAnswerCount}
			<FancyButton
				onclick={() => (slide.answers = [...slide.answers, { text: '', id: Date.now() }])}
			>
				{m.add_answer()}
			</FancyButton>
		{/if}
	</div>
</SlideEditorLayout>

<style>
	.answers {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		width: 20ch;
	}

	.answer-row {
		display: flex;
		gap: 0.2em;
		align-items: center;
		justify-content: center;
	}
</style>
