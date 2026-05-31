<script lang="ts">
	import McqCorrectAnswers from '$lib/question-types/mcq/preview/CorrectAnswers.svelte';
	import OrderCorrectAnswers from '$lib/question-types/order/preview/CorrectAnswers.svelte';
	import TypeAnswerCorrectAnswers from '$lib/question-types/type-answer/preview/CorrectAnswers.svelte';
	import type { Slide } from '$lib/types';

	let { slide }: { slide: Slide } = $props();
</script>

{#if 'MultipleChoice' in slide}
	<McqCorrectAnswers slide={slide.MultipleChoice} />
{:else if 'Order' in slide}
	<OrderCorrectAnswers slide={slide.Order} />
{:else}
	<TypeAnswerCorrectAnswers slide={slide.TypeAnswer} />
{/if}
