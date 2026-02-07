<script>
	import * as m from '$lib/paraglide/messages.js';

	import { buttonColors, limits } from '$lib';
	import Textarea from '$lib/ui/Textarea.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import MediaChooser from './MediaChooser.svelte';
	import arrowDown from '$lib/assets/icons/arrow-down.svg';
	import addAnswer from '$lib/assets/icons/add.svg';
	import Textfield from '$lib/ui/Textfield.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import deleteAnswer from '$lib/assets/icons/delete.svg';
	import Textbox from '$lib/ui/Textbox.svelte';

	/** @type {{slide: import('$lib/types').OrderSlide;}} */
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
	<div
		style:display="flex"
		style:flex-direction="column"
		style:gap="0.5em"
		style:margin="0.5em 0"
		style:max-width="30ch"
		style:width="100%"
	>
		<Textfield
			id="from"
			placeholder="From"
			disabled={false}
			required={false}
			bind:value={slide.axis_labels.from}
		/>
		{#each slide.answers as answer, index (answer.id)}
			<div style:display="flex" style:gap="0.5em" style:align-items="center">
				{#if index < slide.answers.length - 1}
					<IconButton
						src={arrowDown}
						alt="Move down"
						size="1.25em"
						onclick={() => {
							if (index < slide.answers.length - 1) {
								const temp = slide.answers[index];
								slide.answers[index] = slide.answers[index + 1];
								slide.answers[index + 1] = temp;
							}
						}}
					/>
				{:else if slide.answers.length < limits.fuiz.order.maxAnswerCount}
					<IconButton
						src={addAnswer}
						alt={m.add_answer()}
						size="1.25em"
						onclick={() => {
							slide.answers = [...slide.answers, { text: '', id: Date.now() }];
						}}
					/>
				{/if}
				<FancyButton
					backgroundColor={buttonColors.at(index % buttonColors.length)?.[0]}
					backgroundDeepColor={buttonColors.at(index % buttonColors.length)?.[1]}
					active={false}
				>
					<Textbox
						bind:value={slide.answers[index].text}
						placeholder={m.answer_text()}
						textAlign="start"
						lightText
						maxLength={limits.fuiz.maxAnswerTextLength}
					/>
				</FancyButton>
				<IconButton
					src={deleteAnswer}
					alt={m.delete_answer()}
					size="1.25em"
					onclick={() => {
						slide.answers = slide.answers.filter((a) => a.id !== answer.id);
					}}
				/>
			</div>
		{/each}
		{#if slide.answers.length === 0}
			<FancyButton
				onclick={() => {
					slide.answers = [...slide.answers, { text: '', id: Date.now() }];
				}}
			>
				<div style:padding="0.2em 0.6em">{m.add_answer()}</div>
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
</div>
