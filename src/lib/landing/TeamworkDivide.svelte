<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { buttonSymbols } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import { inView } from './inView';
	import ShowcaseText from './ShowcaseText.svelte';

	// The whole question first, all six answers in one outline. When it comes
	// into view the outline divides: its three columns pull apart into three
	// phones, each teammate holding their share.
	const fruits = buttonSymbols.slice(0, 6);
	const hands = [
		[0, 3],
		[1, 4],
		[2, 5]
	];

	// Held together until seen; without script or with reduced motion it's
	// simply divided.
	let whole = $state(false);
	let started = false;

	onMount(() => {
		if (!prefersReducedMotion.current) whole = true;
	});

	function onVisible(visible: boolean) {
		if (!visible || started || !whole) return;
		started = true;
		whole = false;
	}
</script>

<section class="team">
	<ShowcaseText center title={m.collab_over_comp()} description={m.collab_over_comp_desc()} />

	<div class="scene" class:whole aria-hidden="true" {@attach inView(onVisible, 0.5)}>
		<span class="outline"></span>
		{#each hands as hand, p (p)}
			<div class="phone" style:--shift={1 - p}>
				{#each hand as fruit (fruit)}
					{@const Icon = fruits[fruit].icon}
					<span class="tile palette-{fruit}"><Icon /></span>
				{/each}
			</div>
		{/each}
	</div>
</section>

<style>
	.team {
		display: grid;
		justify-items: center;
		gap: 3em;
		max-width: 64em;
		margin: auto;
		padding: 5em 1.5em;
	}

	@media (width <= 50em) {
		.team {
			padding-block: 4em;
		}
	}

	.scene {
		--tile: 2.8em;
		--inner: 0.5em;
		--apart: 3em;
		--line: 2px;
		/* How far each outer phone sits from where its column is in the whole:
		   a phone and a gap, less a tile and the gap between tiles. */
		--pull: calc(var(--apart) + 1.2em + 2 * var(--line) - var(--inner));
		position: relative;
		display: flex;
		gap: var(--apart);
		/* Purely a picture, and the pull is worked out left to right. */
		direction: ltr;
		font-size: min(1em, 3vw);
	}

	.phone {
		display: flex;
		flex-direction: column;
		gap: var(--inner);
		padding: 0.9em 0.6em;
		border: var(--line) solid color-mix(in srgb, var(--on-surface) 30%, transparent);
		border-radius: 1em;
	}

	/* The whole question's outline, around the three columns held together. */
	.outline {
		position: absolute;
		inset: 0 calc(var(--pull) - 0.5em);
		border: var(--line) solid color-mix(in srgb, var(--on-surface) 30%, transparent);
		border-radius: 1em;
		opacity: 0;
		pointer-events: none;
	}

	.whole .phone {
		translate: calc(var(--shift) * var(--pull)) 0;
		border-color: transparent;
	}

	.whole .outline {
		opacity: 1;
	}

	/* Transitions only on the way apart, so holding them together on load is
	   instant. */
	.scene:not(.whole) .phone {
		transition:
			translate 1600ms cubic-bezier(0.6, 0, 0.2, 1) 500ms,
			border-color 800ms ease 1300ms;
	}

	.scene:not(.whole) .outline {
		transition: opacity 700ms ease 500ms;
	}

	.tile {
		display: grid;
		place-items: center;
		width: var(--tile);
		height: var(--tile);
		border-radius: 0.7em;
		background: var(--btn-bg);
		color: #ffffff;
	}

	.tile :global(svg) {
		width: 58%;
		height: 58%;
	}
</style>
