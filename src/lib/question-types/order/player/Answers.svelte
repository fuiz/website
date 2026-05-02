<script lang="ts">
	import { type DragDropState, draggable, droppable } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import ArrowDownward from '~icons/material-symbols/arrow-downward';
	import Topbar from '../../../../routes/[[lang]]/play/Topbar.svelte';

	type Item = { answer: string; id: number };

	let {
		questionText,
		name,
		score,
		media,
		axisLabels,
		showAnswers,
		answers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: undefined | Media;
		axisLabels: { from?: string; to?: string };
		showAnswers: boolean;
		answers: string[];
		onanswer: (answer: string[]) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let answersIndexed = $state<Item[]>(answers.map((answer, index) => ({ answer, id: index })));

	function moveTo(itemId: number, toIndex: number) {
		const fromIndex = answersIndexed.findIndex((i) => i.id === itemId);
		if (fromIndex === -1 || fromIndex === toIndex) return;
		const next = [...answersIndexed];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		answersIndexed = next;
	}

	function swap(a: number, b: number) {
		if (a < 0 || b < 0 || a >= answersIndexed.length || b >= answersIndexed.length) return;
		const next = [...answersIndexed];
		[next[a], next[b]] = [next[b], next[a]];
		answersIndexed = next;
	}

	function handleDragEnter(state: DragDropState<Item>) {
		const { draggedItem, targetContainer } = state;
		if (targetContainer === null) return;
		moveTo(draggedItem.id, parseInt(targetContainer, 10));
	}

	function handleDrop(state: DragDropState<Item>) {
		const { draggedItem, targetContainer, dropPosition } = state;
		if (targetContainer === null) return;
		let toIndex = parseInt(targetContainer, 10);
		if (dropPosition === 'after') toIndex++;
		const fromIndex = answersIndexed.findIndex((i) => i.id === draggedItem.id);
		const adjusted = fromIndex !== -1 && fromIndex < toIndex ? toIndex - 1 : toIndex;
		moveTo(draggedItem.id, adjusted);
	}
</script>

<div class="page">
	<div>
		<Topbar {name} {score} />
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	</div>
	<div class="body">
		<NiceBackground>
			<div class="stack">
				{#if media && showAnswers}
					<div class="media">
						<MediaDisplay {media} fit="contain" />
					</div>
				{/if}
				<div class="content">
					{#if axisLabels.from?.length}
						<div>{axisLabels.from}</div>
					{/if}
					<div class="row">
						<div class="arrow">
							<div class="arrow-body"></div>
							<div class="arrow-head"></div>
						</div>
						<ol class="list">
							{#each answersIndexed as item, actualIndex (item.id)}
								<li
									class="item"
									animate:flip={{ duration: 200 }}
									use:draggable={{
										container: actualIndex.toString(),
										dragData: item,
										handle: '.item'
									}}
									use:droppable={{
										container: actualIndex.toString(),
										direction: 'vertical',
										callbacks: {
											onDrop: handleDrop,
											onDragEnter: handleDragEnter
										}
									}}
								>
									<div class="item-answer">
										<TextAnswerButton
											answerText={item.answer}
											index={item.id}
											correct={undefined}
										/>
									</div>
									{#if actualIndex < answersIndexed.length - 1}
										<IconButton
											alt={m.move_down()}
											onclick={() => swap(actualIndex, actualIndex + 1)}
										>
											<ArrowDownward height="1.5em" />
										</IconButton>
									{/if}
								</li>
							{/each}
						</ol>
					</div>
					{#if axisLabels.to?.length}
						<div>{axisLabels.to}</div>
					{/if}
					<FancyButton
						onclick={() => {
							onanswer(answersIndexed.map(({ answer }) => answer));
						}}
					>
						{m.submit()}
					</FancyButton>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
		min-height: 0;
	}

	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.media {
		height: 40dvh;
	}

	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.4em;
		padding: 1em;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 0.5em;
	}

	.arrow {
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.arrow-body {
		width: 0.2em;
		flex: 1;
		background-color: currentColor;
	}

	.arrow-head {
		width: 0;
		height: 0;
		border-left: 0.6em solid transparent;
		border-right: 0.6em solid transparent;
		border-top: 0.6em solid currentColor;
	}

	.list {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.4em;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	.item:active {
		cursor: grabbing;
	}

	.item-answer {
		flex: 1;
	}

	.item:global(.dragging) {
		opacity: 0.5;
	}

	.list :global(.drop-before::before),
	.list :global(.drop-after::after),
	.list :global(.drop-left::before),
	.list :global(.drop-right::after) {
		display: none;
	}
</style>
