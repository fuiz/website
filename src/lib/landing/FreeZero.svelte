<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import VolunteerActivism from '~icons/material-symbols/volunteer-activism';
	import { inView } from './inView';
	import ShowcaseButton from './ShowcaseButton.svelte';
	import ShowcaseText from './ShowcaseText.svelte';

	// "Free of Charge" as just the number: a huge zero, drawn as a single thin
	// outline that traces itself in when it comes into view, then fills with the
	// faintest wash of the brand red. The zero is written in the page's own
	// digits.
	const zero = (0).toLocaleString(getLocale());

	let shown = $state(false);
</script>

<section class="free">
	<svg
		class:shown
		viewBox="0 0 100 120"
		aria-hidden="true"
		{@attach inView((v) => v && (shown = true), 0.5)}
	>
		<text x="50" y="100">{zero}</text>
	</svg>

	<ShowcaseText title={m.free_of_charge()} description={m.free_of_charge_desc()}>
		<ShowcaseButton
			href="https://opencollective.com/beyond-expiry/projects/fuiz"
			icon={VolunteerActivism}
			label={m.donate()}
		/>
	</ShowcaseText>
</section>

<style>
	.free {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 3em;
		max-width: 64em;
		margin: auto;
		padding: 5em 1.5em;
	}

	@media (width <= 50em) {
		.free {
			grid-template-columns: minmax(0, 1fr);
			padding-block: 4em;
		}

		/* Stacked, the words come first, as in every other section. */
		svg {
			order: 1;
		}
	}

	svg {
		justify-self: center;
		width: min(100%, 18em);
		overflow: visible;
	}

	text {
		font-family: var(--alternative-font);
		font-size: 118px;
		font-weight: 800;
		text-anchor: middle;
		fill: transparent;
		stroke: var(--primary);
		stroke-width: 0.8;
		stroke-dasharray: 700;
		stroke-dashoffset: 700;
		transition:
			stroke-dashoffset 2.2s cubic-bezier(0.6, 0, 0.3, 1),
			fill 900ms ease-out 1.8s;
	}

	.shown text {
		stroke-dashoffset: 0;
		fill: color-mix(in srgb, var(--primary) 8%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		text {
			transition: none;
		}
	}
</style>
