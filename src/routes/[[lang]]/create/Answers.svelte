<script>
	import * as m from '$lib/paraglide/messages.js';

	import { buttonColors, limits } from '$lib';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Icon from '$lib/media/Icon.svelte';
	import variables from '$lib/assets/icons/variables.svg';
	import { scale } from 'svelte/transition';
	import Answer from './Answer.svelte';
	import { backOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';

	/** @type {{answers: import('$lib/types').MultipleChoiceAnswer[];}} */
	let { answers = $bindable() } = $props();
</script>

<div id="grid" style:display="grid" style:gap="0.2em" style:width="100%">
	{#each answers as answer, index (answer.id)}
		<div transition:scale={{ easing: backOut, duration: 300 }} animate:flip={{ duration: 300 }}>
			<Answer
				attention={answers.filter((a) => a.correct).length == 0}
				bind:content={answers[index].content}
				bind:correct={answers[index].correct}
				{index}
				onclick={() => {
					answers.splice(index, 1);
					answers = answers;
				}}
			/>
		</div>
	{/each}
	{#if answers.length < limits.fuiz.multipleChoice.maxAnswerCount}
		<div style:grid-column="1/ -1" transition:scale={{ easing: backOut, duration: 300 }}>
			<FancyButton
				backgroundColor={buttonColors.at(answers.length % buttonColors.length)?.[0]}
				backgroundDeepColor={buttonColors.at(answers.length % buttonColors.length)?.[1]}
				onclick={() => {
					answers.push({
						correct: false,
						content: {
							Text: ''
						},
						id: Date.now()
					});
					answers = answers;
				}}
			>
				<div
					style:height="100%"
					style:text-align="center"
					style:display="flex"
					style:align-items="center"
					style:justify-content="center"
					style:padding="0.2em 0.6em"
					style:gap="0.2em"
					style:box-sizing="border-box"
				>
					<Icon size="1.25em" src={variables} alt={m.add_answer()} />
					<div>{m.add_answer()}</div>
				</div>
			</FancyButton>
		</div>
	{/if}
</div>

<style>
	#grid {
		grid-template-columns: 1fr 1fr;
	}

	@media only screen and (max-width: 600px) {
		#grid {
			grid-template-columns: 1fr;
		}
	}
</style>
