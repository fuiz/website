<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import BrainstormThumbnail from '$lib/question-types/brainstorm/editor/Thumbnail.svelte';
	import FreeTextThumbnail from '$lib/question-types/free-text/editor/Thumbnail.svelte';
	import InfoSlideThumbnail from '$lib/question-types/info-slide/editor/Thumbnail.svelte';
	import McqThumbnail from '$lib/question-types/mcq/editor/Thumbnail.svelte';
	import OrderThumbnail from '$lib/question-types/order/editor/Thumbnail.svelte';
	import PinThumbnail from '$lib/question-types/pin/editor/Thumbnail.svelte';
	import PollThumbnail from '$lib/question-types/poll/editor/Thumbnail.svelte';
	import ScaleThumbnail from '$lib/question-types/scale/editor/Thumbnail.svelte';
	import SliderThumbnail from '$lib/question-types/slider/editor/Thumbnail.svelte';
	import TypeAnswerThumbnail from '$lib/question-types/type-answer/editor/Thumbnail.svelte';
	import type { Slide } from '$lib/types';
	import IconButton from '$lib/ui/IconButton.svelte';
	import ContentCopyOutline from '~icons/material-symbols/content-copy-outline';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		slide,
		index,
		selected,
		ondelete,
		onduplicate,
		onselect
	}: {
		slide: Slide;
		index: number;
		selected: boolean;
		ondelete: () => void;
		onduplicate: () => void;
		onselect: () => void;
	} = $props();
</script>

<div class="row">
	<div class="meta">
		<div>{index + 1}</div>
		<div class="actions">
			<IconButton onclick={ondelete} alt={m.delete_confirm()}>
				<DeleteOutline height="1em" />
			</IconButton>
			<IconButton onclick={onduplicate} alt={m.duplicate()}>
				<ContentCopyOutline height="1em" />
			</IconButton>
		</div>
	</div>
	<button class="thumb" class:selected onclick={onselect}>
		{#if 'MultipleChoice' in slide}
			<McqThumbnail slide={slide.MultipleChoice} />
		{:else if 'Order' in slide}
			<OrderThumbnail slide={slide.Order} />
		{:else if 'Slider' in slide}
			<SliderThumbnail slide={slide.Slider} />
		{:else if 'Scale' in slide}
			<ScaleThumbnail slide={slide.Scale} />
		{:else if 'Poll' in slide}
			<PollThumbnail slide={slide.Poll} />
		{:else if 'Pin' in slide}
			<PinThumbnail slide={slide.Pin} />
		{:else if 'FreeText' in slide}
			<FreeTextThumbnail slide={slide.FreeText} />
		{:else if 'Brainstorm' in slide}
			<BrainstormThumbnail slide={slide.Brainstorm} />
		{:else if 'InfoSlide' in slide}
			<InfoSlideThumbnail slide={slide.InfoSlide} />
		{:else}
			<TypeAnswerThumbnail slide={slide.TypeAnswer} />
		{/if}
	</button>
</div>

<style>
	.row {
		display: flex;
		gap: 0.4em;
		box-sizing: border-box;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		text-align: center;
		align-items: center;
		gap: 0.4em;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		padding: 0.2em 0;
	}

	.thumb {
		flex: 1;
		aspect-ratio: 4 / 3;
		padding: 0;
		appearance: none;
		background: var(--surface-variant);
		font: inherit;
		color: inherit;
		border: none;
		border-radius: 0.5em;
		overflow: hidden;
		cursor: pointer;
	}

	.thumb:where(:hover, :focus-visible) {
		outline: 3px solid var(--outline);
	}

	.thumb.selected {
		outline: 3px solid var(--primary);
	}

	@media only screen and (max-width: 900px) {
		.thumb {
			flex: none;
			width: 8em;
		}
	}
</style>
