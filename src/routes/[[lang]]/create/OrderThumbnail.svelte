<script>
	import { buttonColors } from '$lib/clientOnly';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';

	/** @type {{slide: import('$lib/types').OrderSlide;}} */
	let { slide } = $props();
</script>

<div
	style:display="flex"
	style:gap="0.2em"
	style:height="100%"
	style:overflow="hidden"
	style:max-height="5em"
	style:flex-direction="column"
	style:justify-content="space-between"
	style:background="var(--background-color)"
>
	<div
		style:padding="0.2em"
		style:box-sizing="border-box"
		style:box-shadow="0 2px 2px #00000040"
		style:text-align="center"
		style:font-size="0.6em"
		style:white-space="nowrap"
	>
		{slide.title ? slide.title : '...'}
	</div>
	<VerticalSplit>
		{#snippet top()}
			{#if slide.media}
				<div style:height="50px">
					<MediaContainer media={slide.media} />
				</div>
			{/if}
		{/snippet}
		{#snippet bottom()}
			{#if !slide.answers.length}
				<div
					style:font-size="18px"
					style:padding="0.2em 0.1em"
					style:font-weight="bold"
					style:background="#F5C211"
					style:flex="1"
				>
					{m.no_answers()}
				</div>
			{:else if slide.answers.some((a) => !a.text.length)}
				<div
					style:font-size="18px"
					style:padding="0.2em 0.1em"
					style:font-weight="bold"
					style:background="#F5C211"
					style:flex="1"
				>
					{m.empty_answer()}
				</div>
			{:else if new Set(slide.answers.map((a) => a.text)).size !== slide.answers.length}
				<div
					style:font-size="18px"
					style:padding="0.2em 0.1em"
					style:font-weight="bold"
					style:background="#F5C211"
					style:flex="1"
				>
					{m.duplicate_answers()}
				</div>
			{:else}
				{#each slide.answers as answer, i (answer.id)}
					<div
						style:background={buttonColors.at(i % buttonColors.length)?.at(0) ??
							'var(--accent-color)'}
						style:margin="0.1em"
						style:border-radius="0.6em"
						style:height="0.5em"
					></div>
				{/each}
			{/if}
		{/snippet}
	</VerticalSplit>
</div>
