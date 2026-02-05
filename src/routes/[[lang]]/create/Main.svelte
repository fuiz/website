<script>
	import MultipleChoiceOptionBar from './MultipleChoiceOptionsBar.svelte';
	import OrderOptionsBar from './OrderOptionsBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import SlideEditor from './SlideEditor.svelte';
	import TypeAnswerOptionsBar from './TypeAnswerOptionsBar.svelte';

	/** @type {{config: import('$lib/types').FuizConfig;}} */
	let { config = $bindable() } = $props();

	let selectedSlideIndex = $state(0);

	let activeSlide = $derived(config.slides.at(selectedSlideIndex));
</script>

<div
	id="editor"
	style:display="flex"
	style:flex="1"
	style:align-items="stretch"
	style:background="var(--background-color)"
>
	<Sidebar bind:slides={config.slides} bind:selectedSlideIndex />
	<div style:flex="1" style:display="flex" style:flex-direction="column">
		<SlideEditor bind:slide={config.slides[selectedSlideIndex]} />
	</div>
	{#if activeSlide}
		{#if 'MultipleChoice' in activeSlide}
			<MultipleChoiceOptionBar bind:activeSlide={activeSlide.MultipleChoice} />
		{:else if 'Order' in activeSlide}
			<OrderOptionsBar bind:activeSlide={activeSlide.Order} />
		{:else}
			<TypeAnswerOptionsBar bind:activeSlide={activeSlide.TypeAnswer} />
		{/if}
	{/if}
</div>

<style>
	#editor {
		flex-direction: row;
	}

	@media only screen and (max-width: 900px) {
		#editor {
			flex-direction: column-reverse;
		}
	}
</style>
