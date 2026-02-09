<script>
	import * as m from '$lib/paraglide/messages.js';
	import IconButton from '$lib/ui/IconButton.svelte';
	import ContentCopyOutline from '~icons/material-symbols/content-copy-outline';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import MultipleChoiceThumbnail from './MultipleChoiceThumbnail.svelte';
	import OrderThumbnail from './OrderThumbnail.svelte';
	import TypeAnswerThumbnail from './TypeAnswerThumbnail.svelte';

	/** @type {{slide: import('$lib/types').Slide;index: number;selected: boolean;ondelete: () => void;onduplicate: () => void;onselect: () => void;}} */
	let { slide, index, selected, ondelete, onduplicate, onselect } = $props();
</script>

<div style:display="flex" style:gap="0.4em" style:box-sizing="border-box">
	<div
		style:display="flex"
		style:justify-content="space-between"
		style:flex-direction="column"
		style:text-align="center"
		style:align-items="center"
		style:gap="0.4em"
	>
		<div>
			{index + 1}
		</div>
		<div
			style:display="flex"
			style:flex-direction="column"
			style:gap="0.2em"
			style:padding="0.2em 0"
		>
			<IconButton onclick={ondelete} alt={m.delete_confirm()}
				><DeleteOutline height="1em" /></IconButton
			>
			<IconButton onclick={onduplicate} alt={m.duplicate()}
				><ContentCopyOutline height="1em" /></IconButton
			>
		</div>
	</div>
	<button
		class="thumb"
		style:flex="1"
		style:padding="0"
		style:appearance="none"
		style:background="none"
		style:font="inherit"
		style:color="inherit"
		style:border="none"
		style:outline={selected ? '3px solid var(--accent-color)' : '1px solid darkgray'}
		style:border-radius="0.5em"
		style:overflow="hidden"
		style:cursor="pointer"
		onclick={onselect}
	>
		{#if 'MultipleChoice' in slide}
			<MultipleChoiceThumbnail slide={slide.MultipleChoice} />
		{:else if 'Order' in slide}
			<OrderThumbnail slide={slide.Order} />
		{:else}
			<TypeAnswerThumbnail slide={slide.TypeAnswer} />
		{/if}
	</button>
</div>

<style>
	@media only screen and (max-width: 600px) {
		.thumb {
			width: 150px;
		}
	}
</style>
