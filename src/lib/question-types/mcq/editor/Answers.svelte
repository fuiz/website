<script lang="ts">
	import { flip } from 'svelte/animate';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import { buttonColors, limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import type { MultipleChoiceAnswer } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import VariableAddOutline from '~icons/material-symbols/variable-add-outline';
	import Answer from './Answer.svelte';

	let {
		answers = $bindable()
	}: {
		answers: MultipleChoiceAnswer[];
	} = $props();
</script>

<div class="grid">
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
		<div class="add-cell" transition:scale={{ easing: backOut, duration: 300 }}>
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
				<div class="add-label">
					<VariableAddOutline height="1.25em" title={m.add_answer()} />
					<div>{m.add_answer()}</div>
				</div>
			</FancyButton>
		</div>
	{/if}
</div>

<style>
	.grid {
		display: grid;
		gap: 0.2em;
		width: 100%;
		grid-template-columns: 1fr 1fr;
	}

	.add-cell {
		grid-column: 1 / -1;
	}

	.add-label {
		height: 100%;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.2em 0.6em;
		gap: 0.2em;
		box-sizing: border-box;
	}

	@media only screen and (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
