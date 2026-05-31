<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { type DndEvent, dndzone } from 'svelte-dnd-action';
	import { limits } from '$lib/clientOnly';
	import Modal from '$lib/feedback/Modal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Slide } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import FirstPage from '~icons/material-symbols/first-page';
	import LastPage from '~icons/material-symbols/last-page';
	import MagnifyDocked from '~icons/material-symbols/magnify-docked';
	import Thumbnail from './Thumbnail.svelte';

	let {
		slides = $bindable(),
		selectedSlideIndex = $bindable()
	}: {
		slides: Slide[];
		selectedSlideIndex: number;
	} = $props();

	async function handleConsider(e: CustomEvent<DndEvent<Slide>>) {
		const id = slides.at(selectedSlideIndex)?.id ?? 0;
		slides = e.detail.items;
		const newIndex = e.detail.items.findIndex((s) => s.id === id);
		selectedSlideIndex =
			newIndex === -1
				? e.detail.items.findIndex((s) => s.id.toString().startsWith('id'))
				: newIndex;
	}

	async function handleFinalize(e: CustomEvent<DndEvent<Slide>>) {
		const id = slides.at(selectedSlideIndex)?.id ?? 0;

		slides = e.detail.items;

		if (id.toString().startsWith('id')) {
			selectedSlideIndex = e.detail.items.findIndex(
				(s) => s.id.toString() === e.detail.info.id.toString()
			);
		}
	}

	let section = $state<HTMLElement>();

	function clamp(min: number, value: number, max: number): number {
		return Math.min(max, Math.max(value, min));
	}

	async function changeSelected(newValue: number) {
		if (!section) return;

		const clamped = Math.min(Math.max(0, newValue), slides.length - 1);
		selectedSlideIndex = clamped;

		await tick();

		const selectedSlide = document.querySelector(`#slide_${clamped}`);
		if (!selectedSlide) return;

		const selectedRect = selectedSlide.getBoundingClientRect();
		const parentRect = section.getBoundingClientRect();
		section.scrollTo({
			top:
				section.scrollTop +
				clamp(selectedRect.bottom - parentRect.bottom, 0, selectedRect.y - parentRect.y),
			left:
				section.scrollLeft +
				clamp(selectedRect.right - parentRect.right, 0, selectedRect.x - parentRect.x)
		});
	}

	let addModal = $state<Modal>();

	async function onDelete(index: number) {
		slides.splice(index, 1);
		if (index <= selectedSlideIndex) {
			await changeSelected(selectedSlideIndex - 1);
		}
	}
</script>

<div id="sidebar">
	<div class="sidebar-body switched">
		<div class="slides-wrap">
			<section
				bind:this={section}
				use:dndzone={{ items: slides, flipDurationMs: 100, dropTargetStyle: {} }}
				class="slides switched"
				onconsider={handleConsider}
				onfinalize={handleFinalize}
			>
				{#each slides as slide, index (slide.id)}
					<div
						id="slide_{index}"
						class="slide-wrap"
						animate:flip={{ duration: 300 }}
					>
						<Thumbnail
							{slide}
							{index}
							selected={index === selectedSlideIndex}
							onselect={() => changeSelected(index)}
							ondelete={() => onDelete(index)}
							onduplicate={() => {
								const sameSlide = structuredClone($state.snapshot(slide));
								sameSlide.id = Date.now();
								slides.splice(index + 1, 0, sameSlide);
								slides = slides;
								changeSelected(index + 1);
							}}
						/>
					</div>
				{/each}
			</section>
		</div>
		<div id="add-button">
			<FancyButton
				disabled={slides.length >= limits.fuiz.maxSlidesCount}
				onclick={() => addModal?.open()}
			>
				<div class="add-label">
					<MagnifyDocked height="1em" title={m.add_slide()} />
					<div class="would-be-hidden">{m.add_slide()}</div>
				</div>
			</FancyButton>
		</div>
	</div>
	<div id="controls">
		<div>
			<IconButton alt={m.first_slide()} padding="0.2em" onclick={() => changeSelected(0)}
				><FirstPage height="1.2em" /></IconButton
			>
		</div>
		<div>
			<IconButton
				alt={m.prev_slide()}
				padding="0.2em"
				onclick={() => changeSelected(selectedSlideIndex - 1)}
				><ChevronLeft height="1.2em" /></IconButton
			>
		</div>
		<div>
			<div class="counter">
				{selectedSlideIndex + 1}
			</div>
		</div>
		<div>
			<IconButton
				alt={m.next_slide()}
				padding="0.2em"
				onclick={() => changeSelected(selectedSlideIndex + 1)}
				><ChevronRight height="1.2em" /></IconButton
			>
		</div>
		<div>
			<IconButton
				alt={m.last_slide()}
				padding="0.2em"
				onclick={() => changeSelected(slides.length - 1)}><LastPage height="1.2em" /></IconButton
			>
		</div>
	</div>
</div>

<Modal bind:this={addModal}>
	<h2 class="modal-title">{m.add_slide()}</h2>
	<div class="slide-types">
		<FancyButton
			onclick={() => {
				addModal?.close();
				slides.push({
					MultipleChoice: {
						title: '',
						media: undefined,
						introduce_question: limits.fuiz.multipleChoice.introduceQuestion,
						time_limit: limits.fuiz.multipleChoice.defaultTimeLimit,
						points_awarded: limits.fuiz.multipleChoice.pointsAwarded,
						answers: []
					},
					id: Date.now()
				});
				slides = slides;
				changeSelected(slides.length - 1);
			}}
		>
			<div class="slide-type-label">{m.multiple_choice()}</div>
		</FancyButton>
		<FancyButton
			onclick={() => {
				addModal?.close();
				slides.push({
					TypeAnswer: {
						title: '',
						introduce_question: limits.fuiz.typeAnswer.introduceQuestion,
						time_limit: limits.fuiz.typeAnswer.defaultTimeLimit,
						points_awarded: limits.fuiz.typeAnswer.pointsAwarded,
						case_sensitive: false,
						answers: []
					},
					id: Date.now()
				});
				slides = slides;
				changeSelected(slides.length - 1);
			}}
		>
			<div class="slide-type-label">{m.short_answer()}</div>
		</FancyButton>
		<FancyButton
			onclick={() => {
				addModal?.close();
				slides.push({
					Order: {
						title: '',
						introduce_question: limits.fuiz.order.introduceQuestion,
						time_limit: limits.fuiz.order.defaultTimeLimit,
						points_awarded: limits.fuiz.order.pointsAwarded,
						axis_labels: { from: '', to: '' },
						answers: []
					},
					id: Date.now()
				});
				slides = slides;
				changeSelected(slides.length - 1);
			}}
		>
			<div class="slide-type-label">{m.puzzle()}</div>
		</FancyButton>
	</div>
</Modal>

<style>
	#sidebar {
		width: 12em;
		border-inline-end: 1px solid var(--outline);
		display: flex;
		flex-direction: column;
	}

	.sidebar-body {
		flex: 1;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.slides-wrap {
		flex: 1;
		box-sizing: border-box;
	}

	.slides {
		display: flex;
		width: 0;
		min-width: 100%;
		min-height: 100%;
		gap: 0.2em;
		overflow: auto;
	}

	.slide-wrap {
		padding: 0.4em;
		box-sizing: border-box;
		height: fit-content;
	}

	.counter {
		height: 1.2em;
		aspect-ratio: 1/1;
		padding: 0.2em;
		text-align: center;
		font-weight: bold;
	}

	.switched {
		flex-direction: column;
	}

	#add-button {
		padding: 0.4em;
		border-top: 1px solid var(--outline);
	}

	#controls {
		display: none;
		padding: 0.4em;

		& > div {
			background: color-mix(in srgb, currentColor 20%, transparent);
			border-radius: 0.2em;
		}
	}

	section {
		height: 0;
	}

	.add-label {
		padding: 0.2em 0.4em;
		height: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.2em;
	}

	.modal-title {
		font-family: var(--alternative-font);
		margin: 0 0 0.7em;
		font-size: 1.25em;
	}

	.slide-types {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.slide-type-label {
		padding: 0.2em 0.6em;
		font-family: var(--alternative-font);
	}

	@media only screen and (max-width: 900px) {
		section {
			height: unset;
		}

		#add-button {
			border-inline-start: 1px solid var(--outline);
			border-top: none;
		}

		#controls {
			border-top: 1px solid var(--outline);
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 0.2em;
		}

		#sidebar {
			width: unset;
			height: unset;
			border-top: 1px solid var(--outline);
			border-inline-end: none;
		}

		.switched {
			flex-direction: row;
		}

		.would-be-hidden {
			display: none;
		}
	}
</style>
