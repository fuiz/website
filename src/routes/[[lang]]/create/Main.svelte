<script lang="ts">
	import BrainstormOptionsBar from '$lib/question-types/brainstorm/editor/OptionsBar.svelte';
	import FreeTextOptionsBar from '$lib/question-types/free-text/editor/OptionsBar.svelte';
	import InfoSlideOptionsBar from '$lib/question-types/info-slide/editor/OptionsBar.svelte';
	import McqOptionsBar from '$lib/question-types/mcq/editor/OptionsBar.svelte';
	import OrderOptionsBar from '$lib/question-types/order/editor/OptionsBar.svelte';
	import PinOptionsBar from '$lib/question-types/pin/editor/OptionsBar.svelte';
	import PollOptionsBar from '$lib/question-types/poll/editor/OptionsBar.svelte';
	import ScaleOptionsBar from '$lib/question-types/scale/editor/OptionsBar.svelte';
	import SliderOptionsBar from '$lib/question-types/slider/editor/OptionsBar.svelte';
	import TypeAnswerOptionsBar from '$lib/question-types/type-answer/editor/OptionsBar.svelte';
	import type { FuizConfig } from '$lib/types';
	import Sidebar from './Sidebar.svelte';
	import SlideEditor from './SlideEditor.svelte';

	let {
		config = $bindable()
	}: {
		config: FuizConfig;
	} = $props();

	let selectedSlideIndex = $state(0);

	let activeSlide = $derived(config.slides.at(selectedSlideIndex));
</script>

<div id="editor">
	<Sidebar bind:slides={config.slides} bind:selectedSlideIndex />
	<div class="editor-main">
		<SlideEditor bind:slide={config.slides[selectedSlideIndex]} />
	</div>
	{#if activeSlide}
		{#if 'MultipleChoice' in activeSlide}
			<McqOptionsBar bind:activeSlide={activeSlide.MultipleChoice} />
		{:else if 'Order' in activeSlide}
			<OrderOptionsBar bind:activeSlide={activeSlide.Order} />
		{:else if 'Slider' in activeSlide}
			<SliderOptionsBar bind:activeSlide={activeSlide.Slider} />
		{:else if 'Scale' in activeSlide}
			<ScaleOptionsBar bind:activeSlide={activeSlide.Scale} />
		{:else if 'Poll' in activeSlide}
			<PollOptionsBar bind:activeSlide={activeSlide.Poll} />
		{:else if 'Pin' in activeSlide}
			<PinOptionsBar bind:activeSlide={activeSlide.Pin} />
		{:else if 'FreeText' in activeSlide}
			<FreeTextOptionsBar bind:activeSlide={activeSlide.FreeText} />
		{:else if 'Brainstorm' in activeSlide}
			<BrainstormOptionsBar bind:activeSlide={activeSlide.Brainstorm} />
		{:else if 'InfoSlide' in activeSlide}
			<InfoSlideOptionsBar bind:activeSlide={activeSlide.InfoSlide} />
		{:else}
			<TypeAnswerOptionsBar bind:activeSlide={activeSlide.TypeAnswer} />
		{/if}
	{/if}
</div>

<style>
	#editor {
		display: flex;
		flex: 1;
		flex-direction: row;
		align-items: stretch;
		background: var(--surface);
	}

	.editor-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	@media only screen and (max-width: 900px) {
		#editor {
			flex-direction: column-reverse;
		}
	}
</style>
