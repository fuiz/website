<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Icon from '$lib/Icon.svelte';
	import ghost from '$lib/assets/ghost.svg';
	import MultipleChoiceSlideEditor from './MultipleChoiceSlideEditor.svelte';
	import type { Slide } from '$lib/types';
	import TypeAnswerSlideEditor from './TypeAnswerSlideEditor.svelte';
	import OrderSlideEditor from './OrderSlideEditor.svelte';

	interface Props {
		slide: Slide | undefined;
	}

	let { slide = $bindable() }: Props = $props();
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
		<Icon src={ghost} size="min(30vh, 60vw)" alt={m.no_slides()} />
		{m.no_slides()}
	</div>
{:else if 'MultipleChoice' in slide}
	<MultipleChoiceSlideEditor bind:slide={slide.MultipleChoice} />
{:else if 'Order' in slide}
	<OrderSlideEditor bind:slide={slide.Order} />
{:else}
	<TypeAnswerSlideEditor bind:slide={slide.TypeAnswer} />
{/if}
