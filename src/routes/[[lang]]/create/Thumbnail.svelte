<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import McqThumbnail from '$lib/question-types/mcq/editor/Thumbnail.svelte';
	import OrderThumbnail from '$lib/question-types/order/editor/Thumbnail.svelte';
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
		background: none;
		font: inherit;
		color: inherit;
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		overflow: hidden;
		cursor: pointer;
		transition:
			border-color 100ms ease-out,
			box-shadow 100ms ease-out;
	}

	.thumb.selected {
		border-color: var(--primary);
		box-shadow: 0 0 0 1px var(--primary);
	}

	@media only screen and (max-width: 900px) {
		.thumb {
			flex: none;
			width: 8em;
		}
	}
</style>
