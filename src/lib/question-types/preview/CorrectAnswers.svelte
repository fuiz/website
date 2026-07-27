<script lang="ts">
	import BrainstormCorrectAnswers from '$lib/question-types/brainstorm/preview/CorrectAnswers.svelte';
	import FreeTextCorrectAnswers from '$lib/question-types/free-text/preview/CorrectAnswers.svelte';
	import InfoSlideCorrectAnswers from '$lib/question-types/info-slide/preview/CorrectAnswers.svelte';
	import McqCorrectAnswers from '$lib/question-types/mcq/preview/CorrectAnswers.svelte';
	import OrderCorrectAnswers from '$lib/question-types/order/preview/CorrectAnswers.svelte';
	import PinCorrectAnswers from '$lib/question-types/pin/preview/CorrectAnswers.svelte';
	import PollCorrectAnswers from '$lib/question-types/poll/preview/CorrectAnswers.svelte';
	import ScaleCorrectAnswers from '$lib/question-types/scale/preview/CorrectAnswers.svelte';
	import SliderCorrectAnswers from '$lib/question-types/slider/preview/CorrectAnswers.svelte';
	import TypeAnswerCorrectAnswers from '$lib/question-types/type-answer/preview/CorrectAnswers.svelte';
	import type { Slide } from '$lib/types';

	let { slide }: { slide: Slide } = $props();
</script>

{#if 'MultipleChoice' in slide}
	<McqCorrectAnswers slide={slide.MultipleChoice} />
{:else if 'Order' in slide}
	<OrderCorrectAnswers slide={slide.Order} />
{:else if 'Slider' in slide}
	<SliderCorrectAnswers slide={slide.Slider} />
{:else if 'Scale' in slide}
	<ScaleCorrectAnswers slide={slide.Scale} />
{:else if 'Poll' in slide}
	<PollCorrectAnswers slide={slide.Poll} />
{:else if 'Pin' in slide}
	<PinCorrectAnswers slide={slide.Pin} />
{:else if 'FreeText' in slide}
	<FreeTextCorrectAnswers slide={slide.FreeText} />
{:else if 'Brainstorm' in slide}
	<BrainstormCorrectAnswers slide={slide.Brainstorm} />
{:else if 'InfoSlide' in slide}
	<InfoSlideCorrectAnswers slide={slide.InfoSlide} />
{:else}
	<TypeAnswerCorrectAnswers slide={slide.TypeAnswer} />
{/if}
