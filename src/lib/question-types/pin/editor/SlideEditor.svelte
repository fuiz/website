<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import PinBoard from '$lib/game/PinBoard.svelte';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import { isDegenerateShape } from '$lib/question-types/pin/shared/correctness';
	import { type PinShape, type PinSlide, type PinTool, pinTools } from '$lib/types';
	import Switch from '$lib/ui/Switch.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import Gesture from '~icons/material-symbols/gesture';
	import RadioButtonUnchecked from '~icons/material-symbols/radio-button-unchecked';
	import Refresh from '~icons/material-symbols/refresh';
	import SquareOutline from '~icons/material-symbols/square-outline';

	let {
		slide = $bindable()
	}: {
		slide: PinSlide;
	} = $props();

	if (slide.time_limit != null && slide.time_limit < 1000) slide.time_limit *= 1000;

	const TOOL_ICONS = {
		Rectangle: SquareOutline,
		Ellipse: RadioButtonUnchecked,
		Polygon: Gesture
	} as const;

	const TOOL_LABELS: Record<PinTool, () => string> = {
		Rectangle: m.tool_rectangle,
		Ellipse: m.tool_ellipse,
		Polygon: m.tool_freehand
	};

	/** The default target: an ellipse over the middle of the picture. */
	function defaultShape(): PinShape {
		return { Ellipse: { center: { x: 0.5, y: 0.5 }, radius_x: 0.15, radius_y: 0.2 } };
	}

	let tool = $state<PinTool>('Ellipse');

	// Remembered so toggling scoring off and back on restores the author's work
	// rather than dropping a fresh blob in the middle of the image.
	let lastShape = $state<PinShape>(slide.correct_area ?? defaultShape());

	let scored = $derived(slide.correct_area != null);
	let needsRedraw = $derived(scored && isDegenerateShape(slide.correct_area));

	function setScored(on: boolean) {
		if (on) {
			slide.correct_area = structuredClone($state.snapshot(lastShape));
		} else {
			if (slide.correct_area) lastShape = structuredClone($state.snapshot(slide.correct_area));
			slide.correct_area = null;
			// Nothing can be right, so nothing can be scored.
			slide.points_awarded = 0;
		}
	}
</script>

<SlideEditorLayout>
	{#snippet media()}
		<MediaChooser bind:media={slide.media} />
	{/snippet}
	{#snippet title()}
		<Textarea
			bind:value={slide.title}
			placeholder={m.question_text()}
			id="question_title"
			required={false}
			disabled={false}
			maxHeight="4em"
			maxLength={limits.fuiz.pin.maxTitleLength}
		/>
	{/snippet}

	<div class="editor">
		{#if slide.media}
			<div class="canvas">
				{#if scored}
					<!-- The tool rail sits beside the picture, as in the reference
					     editors: pick a shape, then drag it out over the image. -->
					<div class="tools">
						<div class="tool-group" role="radiogroup" aria-label={m.correct_area()}>
							{#each pinTools as name (name)}
								{@const Icon = TOOL_ICONS[name]}
								<button
									type="button"
									class="tool"
									class:active={tool === name}
									role="radio"
									aria-checked={tool === name}
									title={TOOL_LABELS[name]()}
									onclick={() => (tool = name)}
								>
									<Icon height="1.2em" />
								</button>
							{/each}
						</div>
						<!-- Reset isn't a fourth way to draw, it's an action, so it sits
						     outside the radio group and is styled as one. -->
						<div class="actions">
							<button
								type="button"
								class="reset"
								title={m.reset_area()}
								onclick={() => (slide.correct_area = defaultShape())}
							>
								<Refresh height="1.1em" />
							</button>
						</div>
					</div>
				{/if}
				<div class="board">
					<PinBoard
						media={slide.media}
						shape={slide.correct_area ?? undefined}
						showShape={scored}
						tool={scored ? tool : undefined}
						ondraw={(drawn) => {
							slide.correct_area = drawn;
							lastShape = drawn;
						}}
					/>
				</div>
			</div>
		{:else}
			<p class="warn">{m.no_media()}</p>
		{/if}

		<div class="controls">
			<Switch id="pin_scored" checked={scored} onchange={(on) => setScored(on)}>
				{m.pin_has_target()}
			</Switch>

			{#if !scored}
				<p class="hint">{m.drop_pin_hint()}</p>
			{:else if needsRedraw}
				<p class="warn">{m.no_target()}</p>
			{:else}
				<p class="hint">{m.pin_draw_hint({ tool: TOOL_LABELS[tool]() })}</p>
			{/if}
		</div>
	</div>
</SlideEditorLayout>

<style>
	.editor {
		width: 100%;
		max-width: 34em;
		display: flex;
		flex-direction: column;
		gap: 0.7em;
		margin-bottom: 0.5em;
	}

	.canvas {
		display: flex;
		gap: 0.5em;
		align-items: stretch;
		height: 15em;
		max-height: 42vh;
	}

	.tools {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
		flex: none;
		align-items: stretch;
	}

	.tool-group {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}

	.actions {
		display: flex;
		justify-content: center;
		border-top: 1px solid var(--outline);
		margin-top: 0.15em;
		padding-top: 0.4em;
	}

	.tool {
		appearance: none;
		font: inherit;
		color: inherit;
		display: grid;
		place-items: center;
		width: 2.2em;
		height: 2.2em;
		border-radius: 0.45em;
		border: 1px solid var(--outline);
		background: var(--surface);
		cursor: pointer;
		transition:
			border-color 100ms ease-out,
			background 100ms ease-out,
			color 100ms ease-out;
	}

	.tool:where(:hover, :focus-visible) {
		border-color: var(--primary);
		color: var(--primary);
		outline: none;
	}

	.tool.active {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--on-primary);
	}

	/* Deliberately not a `.tool`: no box, no selected state, quieter by default,
	   so it never reads as a shape you could be drawing with. */
	.reset {
		appearance: none;
		font: inherit;
		display: grid;
		place-items: center;
		width: 2.2em;
		height: 1.8em;
		border: none;
		border-radius: 0.4em;
		background: none;
		color: inherit;
		opacity: 0.55;
		cursor: pointer;
		transition:
			opacity 100ms ease-out,
			background 100ms ease-out,
			color 100ms ease-out;
	}

	.reset:where(:hover, :focus-visible) {
		opacity: 1;
		color: var(--primary);
		background: color-mix(in srgb, var(--primary) 10%, transparent);
		outline: none;
	}

	.board {
		flex: 1;
		min-width: 0;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
	}

	.hint,
	.warn {
		margin: 0;
		text-align: center;
		font-size: 0.85em;
	}

	.hint {
		opacity: 0.7;
	}

	.warn {
		color: var(--error, #b3261e);
		font-weight: 600;
	}
</style>
