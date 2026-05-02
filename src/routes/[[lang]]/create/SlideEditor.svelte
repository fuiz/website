<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { Slide } from '$lib/types';

	import GhostIcon from '~icons/custom/ghost';
	import MultipleChoiceSlideEditor from './MultipleChoiceSlideEditor.svelte';
	import OrderSlideEditor from './OrderSlideEditor.svelte';
	import TypeAnswerSlideEditor from './TypeAnswerSlideEditor.svelte';

	let {
		slide = $bindable()
	}: {
		slide: Slide | undefined;
	} = $props();
</script>

{#if slide === undefined}
	<div
		style:flex="1"
		style:display="flex"
		style:flex-direction="column"
		style:align-items="center"
		style:justify-content="center"
		style:text-align="center"
		style:font-size="2em"
		style:opacity="0.4"
	>
		<GhostIcon height="min(30vh, 60vw)" width="min(30vh, 60vw)" title={m.no_slides()} />
		{m.no_slides()}
	</div>
{:else if 'MultipleChoice' in slide}
	<MultipleChoiceSlideEditor bind:slide={slide.MultipleChoice} />
{:else if 'Order' in slide}
	<OrderSlideEditor bind:slide={slide.Order} />
{:else}
	<TypeAnswerSlideEditor bind:slide={slide.TypeAnswer} />
{/if}
