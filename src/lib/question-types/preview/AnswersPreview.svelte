<script lang="ts">
	import BrainstormAnswersPreview from '$lib/question-types/brainstorm/preview/AnswersPreview.svelte';
	import FreeTextAnswersPreview from '$lib/question-types/free-text/preview/AnswersPreview.svelte';
	import InfoSlideAnswersPreview from '$lib/question-types/info-slide/preview/AnswersPreview.svelte';
	import McqAnswersPreview from '$lib/question-types/mcq/preview/AnswersPreview.svelte';
	import OrderAnswersPreview from '$lib/question-types/order/preview/AnswersPreview.svelte';
	import PinAnswersPreview from '$lib/question-types/pin/preview/AnswersPreview.svelte';
	import PollAnswersPreview from '$lib/question-types/poll/preview/AnswersPreview.svelte';
	import ScaleAnswersPreview from '$lib/question-types/scale/preview/AnswersPreview.svelte';
	import SliderAnswersPreview from '$lib/question-types/slider/preview/AnswersPreview.svelte';
	import TypeAnswerAnswersPreview from '$lib/question-types/type-answer/preview/AnswersPreview.svelte';
	import type { IdlessSlide } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessSlide;
		/** Whether to reveal the answer key. Opinion and info slides have none. */
		showAnswers: boolean;
	} = $props();
</script>

{#if 'MultipleChoice' in slide}
	<McqAnswersPreview slide={slide.MultipleChoice} {showAnswers} />
{:else if 'Order' in slide}
	<OrderAnswersPreview slide={slide.Order} {showAnswers} />
{:else if 'Slider' in slide}
	<SliderAnswersPreview slide={slide.Slider} {showAnswers} />
{:else if 'Scale' in slide}
	<ScaleAnswersPreview slide={slide.Scale} />
{:else if 'Poll' in slide}
	<PollAnswersPreview slide={slide.Poll} {showAnswers} />
{:else if 'Pin' in slide}
	<PinAnswersPreview slide={slide.Pin} {showAnswers} />
{:else if 'FreeText' in slide}
	<FreeTextAnswersPreview slide={slide.FreeText} />
{:else if 'Brainstorm' in slide}
	<BrainstormAnswersPreview slide={slide.Brainstorm} />
{:else if 'InfoSlide' in slide}
	<InfoSlideAnswersPreview slide={slide.InfoSlide} />
{:else}
	<TypeAnswerAnswersPreview slide={slide.TypeAnswer} {showAnswers} />
{/if}
