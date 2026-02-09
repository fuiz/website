<script>
	import * as m from '$lib/paraglide/messages.js';

	import { limits } from '$lib/clientOnly';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import { flip } from 'svelte/animate';
	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import FirstPage from '~icons/material-symbols/first-page';
	import LastPage from '~icons/material-symbols/last-page';
	import Thumbnail from './Thumbnail.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import MagnifyDocked from '~icons/material-symbols/magnify-docked';
	import IconButton from '$lib/ui/IconButton.svelte';
	import { tick } from 'svelte';

	/** @type {{slides: import('$lib/types').Slide[];selectedSlideIndex: number;}} */
	let { slides = $bindable(), selectedSlideIndex = $bindable() } = $props();

	/**
	 * @param {CustomEvent<import('svelte-dnd-action').DndEvent<import('$lib/types').Slide>>} e
	 */
	async function handleConsider(e) {
		const id = slides.at(selectedSlideIndex)?.id ?? 0;
		slides = e.detail.items;
		const newIndex = e.detail.items.findIndex((s) => s.id === id);
		selectedSlideIndex =
			newIndex === -1
				? e.detail.items.findIndex((s) => s.id.toString().startsWith('id'))
				: newIndex;
	}

	/**
	 * @param {CustomEvent<import('svelte-dnd-action').DndEvent<import('$lib/types').Slide>>} e
	 */
	async function handleFinalize(e) {
		const id = slides.at(selectedSlideIndex)?.id ?? 0;

		slides = e.detail.items;

		if (id.toString().startsWith('id')) {
			selectedSlideIndex = e.detail.items.findIndex(
				(s) => s.id.toString() === e.detail.info.id.toString()
			);
		}
	}

	/** @type {HTMLElement | undefined} */
	let section = $state();

	/**
	 * @param {number} min
	 * @param {number} value
	 * @param {number} max
	 * @returns {number}
	 */
	function clamp(min, value, max) {
		return Math.min(max, Math.max(value, min));
	}

	/**
	 * @param {number} newValue
	 */
	async function changeSelected(newValue) {
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

	/** @type {HTMLElement | undefined} */
	let popoverElement = $state();

	/**
	 * @param {number} index
	 */
	async function onDelete(index) {
		slides.splice(index, 1);
		if (index <= selectedSlideIndex) {
			await changeSelected(selectedSlideIndex - 1);
		}
	}
</script>

<div id="sidebar" style:display="flex" style:flex-direction="column">
	<div
		class="switched"
		style:flex="1"
		style:display="flex"
		style:align-items="stretch"
		style:justify-content="space-between"
		style:box-sizing="border-box"
	>
		<div style:flex="1" style:flex-direction="column" style:box-sizing="border-box">
			<section
				bind:this={section}
				use:dndzone={{ items: slides, flipDurationMs: 100, dropTargetStyle: {} }}
				class="switched"
				style:display="flex"
				style:width="0"
				style:min-height="100%"
				style:min-width="100%"
				style:gap="0.2em"
				style:overflow="auto"
				onconsider={handleConsider}
				onfinalize={handleFinalize}
			>
				{#each slides as slide, index (slide.id)}
					<div
						id="slide_{index}"
						style:padding="0.4em"
						style:box-sizing="border-box"
						style:height="fit-content"
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
			<div
				popover="auto"
				bind:this={popoverElement}
				style:border="4px solid currentColor"
				style:background="var(--background-color)"
				style:border-radius="1em"
				style:padding="1em"
			>
				<FancyButton
					onclick={() => {
						popoverElement?.hidePopover();
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
					<div style:padding="0.2em 0.6em">
						{m.multiple_choice()}
					</div>
				</FancyButton>
				<FancyButton
					onclick={() => {
						popoverElement?.hidePopover();
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
					<div style:padding="0.2em 0.6em">{m.short_answer()}</div>
				</FancyButton>
				<FancyButton
					onclick={() => {
						popoverElement?.hidePopover();
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
					<div style:padding="0.2em 0.6em">{m.puzzle()}</div>
				</FancyButton>
			</div>
			<FancyButton
				disabled={slides.length >= limits.fuiz.maxSlidesCount}
				onclick={() => popoverElement?.showPopover()}
			>
				<div
					style:padding="0.2em 0.4em"
					style:height="100%"
					style:box-sizing="border-box"
					style:display="flex"
					style:align-items="center"
					style:justify-content="center"
					style:gap="0.2em"
				>
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
			<div
				style:height="1.2em"
				style:aspect-ratio="1/1"
				style:padding="0.2em"
				style:text-align="center"
				style:font-weight="bold"
			>
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

<style>
	#sidebar {
		width: 8em;
		border-inline-end: 0.05em solid #00000020;
	}

	.switched {
		flex-direction: column;
	}

	#add-button {
		padding: 0.4em;
		border-top: 0.05em solid #00000020;
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

	[popover]::backdrop {
		background: color-mix(in srgb, currentColor 20%, transparent);
	}

	@media only screen and (max-width: 900px) {
		section {
			height: unset;
		}

		#add-button {
			border-inline-start: 0.05em solid #00000020;
			border-top: none;
		}

		#controls {
			border-top: 0.05em solid #00000020;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 0.2em;
		}

		#sidebar {
			width: unset;
			height: unset;
			border-top: 0.05em solid #00000020;
			border-inline-end: none;
		}

		.switched {
			flex-direction: row;
			width: unset;
			height: unset;
		}

		.would-be-hidden {
			display: none;
		}
	}
</style>
