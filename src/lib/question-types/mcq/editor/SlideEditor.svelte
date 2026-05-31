<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { MultipleChoiceSlide } from '$lib/types';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Answers from './Answers.svelte';

	let {
		slide = $bindable()
	}: {
		slide: MultipleChoiceSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;
	if (slide.introduce_question != null && slide.introduce_question < 1000)
		slide.introduce_question *= 1000;
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
			maxLength={limits.fuiz.multipleChoice.maxTitleLength}
		/>
	{/snippet}
	<Answers bind:answers={slide.answers} />
</SlideEditorLayout>
