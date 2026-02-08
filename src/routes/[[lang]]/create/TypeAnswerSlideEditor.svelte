<script>
	import * as m from '$lib/paraglide/messages.js';

	import { limits } from '$lib';
	import Textarea from '$lib/ui/Textarea.svelte';
	import MediaChooser from './MediaChooser.svelte';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import Textfield from '$lib/ui/Textfield.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';

	/** @type {{slide: import('$lib/types').TypeAnswer;}} */
	let { slide = $bindable() } = $props();

	if (slide.time_limit < 1000) slide.time_limit *= 1000;
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
				maxLength={limits.fuiz.typeAnswer.maxTitleLength}
			/>
		</div>
	</div>
	<div style:display="flex" style:flex-direction="column" style:gap="0.4em" style:width="20ch">
		{#each slide.answers as answer}
			<div
				style:display="flex"
				style:gap="0.2em"
				style:align-items="center"
				style:justify-content="center"
			>
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
</div>
