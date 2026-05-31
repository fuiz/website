<script lang="ts">
	import McqOptionsBar from '$lib/question-types/mcq/editor/OptionsBar.svelte';
	import OrderOptionsBar from '$lib/question-types/order/editor/OptionsBar.svelte';
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
