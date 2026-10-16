<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import { inView } from './inView';
	import ShowcaseText from './ShowcaseText.svelte';
	import { sharpCanvas } from './sharpCanvas';

	// The player limit as exactly `count` dots, one per player, in a plain grid
	// beside the words. They start as faint empty seats and fill one at a time,
	// in no particular order, the way a lobby fills as players join.
	let { count }: { count: number } = $props();

	const formatted = $derived(count.toLocaleString(getLocale()));

	const COLUMNS = 40;
	const FILL_MS = 3200;

	let rows = $derived(Math.ceil(count / COLUMNS));

	// Which seat each player takes: a fixed shuffle, so it looks random but is
	// the same on every visit.
	let order = $derived.by(() => {
		const seats = Array.from({ length: count }, (_, i) => i);
		let seed = 7;
		for (let i = count - 1; i > 0; i--) {
			seed = (seed * 16807) % 2147483647;
			const j = seed % (i + 1);
			[seats[i], seats[j]] = [seats[j], seats[i]];
		}
		return seats;
	});

	let canvas = $state<HTMLCanvasElement>();
	let filled = 0;
	let started = false;
	let frame: number | undefined;

	function draw() {
		const context = canvas?.getContext('2d');
		if (!canvas || !context) return;
		const width = canvas.width;
		const pitch = width / COLUMNS;
		const radius = pitch * 0.3;
		// Colours are read at draw time so a theme switch is picked up.
		const style = getComputedStyle(canvas);
		const empty = style.getPropertyValue('--on-surface').trim();
		const taken = style.color;

		context.clearRect(0, 0, width, canvas.height);
		for (let i = 0; i < count; i++) {
			const lit = order[i] < filled;
			context.globalAlpha = lit ? 1 : 0.13;
			context.fillStyle = lit ? taken : empty;
			context.beginPath();
			context.arc(
				((i % COLUMNS) + 0.5) * pitch,
				(Math.floor(i / COLUMNS) + 0.5) * pitch,
				radius,
				0,
				Math.PI * 2
			);
			context.fill();
		}
		context.globalAlpha = 1;
	}

	function onVisible(visible: boolean) {
		if (!visible || started) return;
		started = true;
		if (prefersReducedMotion.current) return;
		const begin = performance.now();
		frame = requestAnimationFrame(function step(now) {
			const t = Math.min(1, (now - begin) / FILL_MS);
			filled = Math.round((1 - (1 - t) ** 2) * count);
			draw();
			frame = t < 1 ? requestAnimationFrame(step) : undefined;
		});
	}

	onMount(() => {
		if (!canvas) return;
		// With reduced motion every seat is taken from the start.
		if (prefersReducedMotion.current) filled = count;
		const stopSizing = sharpCanvas(canvas, draw);
		return () => {
			stopSizing();
			if (frame !== undefined) cancelAnimationFrame(frame);
		};
	});
</script>

<section class="players">
	<ShowcaseText
		title={m.max_players({ count: formatted })}
		description={m.max_players_desc()}
	/>
	<div class="scene">
		<canvas
			bind:this={canvas}
			style:--columns={COLUMNS}
			style:--rows={rows}
			aria-hidden="true"
			{@attach inView(onVisible, 0.4)}
		></canvas>
	</div>
</section>

<style>
	.players {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 3em;
		max-width: 64em;
		margin: auto;
		padding: 5em 1.5em;
	}

	@media (width <= 50em) {
		.players {
			grid-template-columns: minmax(0, 1fr);
			padding-block: 4em;
		}
	}

	.scene {
		display: flex;
		justify-content: center;
	}

	canvas {
		display: block;
		width: min(100%, 26em);
		aspect-ratio: var(--columns) / var(--rows);
		/* The colour of a taken seat, read by the drawing code. Nudged towards
		   the text colour so it deepens on a light page and brightens on a dark
		   one. */
		color: color-mix(in srgb, var(--btn-bg-5) 78%, var(--on-surface));
	}
</style>
