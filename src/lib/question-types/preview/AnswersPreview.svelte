<script lang="ts">
	import McqAnswersPreview from '$lib/question-types/mcq/preview/AnswersPreview.svelte';
	import OrderAnswersPreview from '$lib/question-types/order/preview/AnswersPreview.svelte';
	import TypeAnswerAnswersPreview from '$lib/question-types/type-answer/preview/AnswersPreview.svelte';
	import type { IdlessSlide } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessSlide;
		showAnswers: boolean;
	} = $props();
</script>

{#if 'MultipleChoice' in slide}
	<McqAnswersPreview slide={slide.MultipleChoice} {showAnswers} />
{:else if 'Order' in slide}
	<OrderAnswersPreview slide={slide.Order} {showAnswers} />
{:else}
	<TypeAnswerAnswersPreview slide={slide.TypeAnswer} {showAnswers} />
{/if}
