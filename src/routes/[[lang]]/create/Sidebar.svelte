<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { type DndEvent, dndzone } from 'svelte-dnd-action';
	import { limits } from '$lib/clientOnly';
	import ConfirmationDialog from '$lib/feedback/ConfirmationDialog.svelte';
	import Modal from '$lib/feedback/Modal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Slide } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import SectionLabel from '$lib/ui/SectionLabel.svelte';
	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import ChevronRight from '~icons/material-symbols/chevron-right';
	import FirstPage from '~icons/material-symbols/first-page';
	import LastPage from '~icons/material-symbols/last-page';
	import MagnifyDocked from '~icons/material-symbols/magnify-docked';
	import { slideGroups, slideTemplates } from './slideTemplates';
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
	let deleteDialog = $state<ConfirmationDialog>();
	let pendingDeleteIndex = $state<number | null>(null);

	function onDelete(index: number) {
		pendingDeleteIndex = index;
		deleteDialog?.open();
	}

	async function confirmDelete() {
		if (pendingDeleteIndex === null) return;
		const index = pendingDeleteIndex;
		pendingDeleteIndex = null;
		slides.splice(index, 1);
		if (index <= selectedSlideIndex) {
			await changeSelected(selectedSlideIndex - 1);
		}
	}

	function addSlide(create: (id: number) => Slide) {
		addModal?.close();
		// `slides` is a deeply reactive prop, so pushing is enough; no
		// `slides = slides` reassignment is needed to trigger an update.
		slides.push(create(Date.now()));
		changeSelected(slides.length - 1);
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

<Modal bind:this={addModal} width="min(62ch, calc(100vw - 2em))">
	<h2 class="modal-title">{m.add_slide()}</h2>
	{#each slideGroups as { group, label } (group)}
		{@const templates = slideTemplates.filter((template) => template.group === group)}
		<section class="group">
			<SectionLabel as="h3" --section-label-margin="0 0 0.4em">{label()}</SectionLabel>
			<div class="slide-types">
				{#each templates as template (template.key)}
					<button
						type="button"
						class="slide-type"
						onclick={() => addSlide(template.create)}
					>
						<div class="slide-type-icon"><template.icon height="1.4em" /></div>
						<div class="slide-type-body">
							<div class="slide-type-title">{template.label()}</div>
							<div class="slide-type-desc">{template.description()}</div>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/each}
</Modal>

<ConfirmationDialog
	bind:this={deleteDialog}
	title={m.delete_forever()}
	message=""
	confirmText={m.delete_confirm()}
	onConfirm={confirmDelete}
/>

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

	/* The slides list is a flex child that must not grow past its parent, so it
	   takes its height from the flex box rather than its content. Scoped to
	   `.slides`, since the add-slide dialog has sections of its own. */
	.slides {
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

	.group + .group {
		margin-top: 1em;
	}

	.slide-types {
		display: grid;
		/* Two across where there's room, one on a narrow phone. */
		grid-template-columns: repeat(auto-fit, minmax(min(13em, 100%), 1fr));
		gap: 0.4em;
	}

	.slide-type {
		appearance: none;
		font: inherit;
		color: inherit;
		text-align: start;
		background: var(--surface);
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		padding: 0.6em 0.7em;
		cursor: pointer;
		display: grid;
		grid-template-columns: 1.8em 1fr;
		gap: 0.6em;
		align-items: center;
		transition:
			border-color 100ms ease-out,
			background 100ms ease-out,
			color 100ms ease-out;
	}

	.slide-type:where(:hover, :focus-visible) {
		border-color: var(--primary);
		background: color-mix(in srgb, var(--primary) 6%, transparent);
		color: var(--primary);
		outline: none;
	}

	.slide-type-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slide-type-title {
		font-family: var(--alternative-font);
		font-weight: 700;
		font-size: 0.95em;
	}

	.slide-type-desc {
		font-size: 0.75em;
		opacity: 0.65;
		line-height: 1.3;
		margin-top: 0.1em;
	}

	.slide-type:where(:hover, :focus-visible) .slide-type-desc {
		opacity: 0.85;
	}

	@media only screen and (max-width: 900px) {
		.slides {
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
