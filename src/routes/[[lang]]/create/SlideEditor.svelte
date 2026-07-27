<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import BrainstormSlideEditor from '$lib/question-types/brainstorm/editor/SlideEditor.svelte';
	import FreeTextSlideEditor from '$lib/question-types/free-text/editor/SlideEditor.svelte';
	import InfoSlideEditor from '$lib/question-types/info-slide/editor/SlideEditor.svelte';
	import McqSlideEditor from '$lib/question-types/mcq/editor/SlideEditor.svelte';
	import OrderSlideEditor from '$lib/question-types/order/editor/SlideEditor.svelte';
	import PinSlideEditor from '$lib/question-types/pin/editor/SlideEditor.svelte';
	import PollSlideEditor from '$lib/question-types/poll/editor/SlideEditor.svelte';
	import ScaleSlideEditor from '$lib/question-types/scale/editor/SlideEditor.svelte';
	import SliderSlideEditor from '$lib/question-types/slider/editor/SlideEditor.svelte';
	import TypeAnswerSlideEditor from '$lib/question-types/type-answer/editor/SlideEditor.svelte';
	import type { Slide } from '$lib/types';
	import GhostIcon from '~icons/custom/ghost';

	let {
		slide = $bindable()
	}: {
		slide: Slide | undefined;
	} = $props();
</script>

{#if slide === undefined}
	<div class="empty">
		<GhostIcon height="min(30vh, 60vw)" width="min(30vh, 60vw)" title={m.no_slides()} />
		{m.no_slides()}
	</div>
{:else if 'MultipleChoice' in slide}
	<McqSlideEditor bind:slide={slide.MultipleChoice} />
{:else if 'Order' in slide}
	<OrderSlideEditor bind:slide={slide.Order} />
{:else if 'Slider' in slide}
	<SliderSlideEditor bind:slide={slide.Slider} />
{:else if 'Scale' in slide}
	<ScaleSlideEditor bind:slide={slide.Scale} />
{:else if 'Poll' in slide}
	<PollSlideEditor bind:slide={slide.Poll} />
{:else if 'Pin' in slide}
	<PinSlideEditor bind:slide={slide.Pin} />
{:else if 'FreeText' in slide}
	<FreeTextSlideEditor bind:slide={slide.FreeText} />
{:else if 'Brainstorm' in slide}
	<BrainstormSlideEditor bind:slide={slide.Brainstorm} />
{:else if 'InfoSlide' in slide}
	<InfoSlideEditor bind:slide={slide.InfoSlide} />
{:else}
	<TypeAnswerSlideEditor bind:slide={slide.TypeAnswer} />
{/if}

<style>
	.empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: 2em;
		opacity: 0.4;
	}
</style>
