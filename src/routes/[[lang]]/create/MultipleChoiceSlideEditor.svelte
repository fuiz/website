<script>
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Answers from './Answers.svelte';
	import MediaChooser from './MediaChooser.svelte';

	/** @type {{slide: import('$lib/types').MultipleChoiceSlide;}} */
	let { slide = $bindable() } = $props();

	if (slide.time_limit < 1000) slide.time_limit *= 1000;
	if (slide.introduce_question < 1000) slide.introduce_question *= 1000;
</script>

<div
	style:flex="1"
	style:display="flex"
	style:flex-direction="column"
	style:gap="0.2em"
	style:padding="0.6em 0.4em 0.4em"
	style:align-items="center"
	style:justify-content="space-between"
>
	<div
		style:display="flex"
		style:flex-wrap="wrap-reverse"
		style:width="100%"
		style:justify-content="center"
		style:align-items="end"
		style:max-width="30ch"
		style:gap="0.2em"
	>
		<div style:display="flex" style:align-items="center" style:justify-content="center">
			<MediaChooser bind:media={slide.media} />
		</div>
		<div
			style:max-width="25ch"
			style:flex="1"
			style:min-width="fit-content"
			style:padding-top="0.5em"
			style:overflow="auto"
		>
			<Textarea
				bind:value={slide.title}
				placeholder={m.question_text()}
				id="question_title"
				required={false}
				disabled={false}
				maxHeight="4em"
				maxLength={limits.fuiz.multipleChoice.maxTitleLength}
			/>
		</div>
	</div>
	<Answers bind:answers={slide.answers} />
</div>
