<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '~icons/material-symbols/code-rounded';
	import { inView } from './inView';
	import ShowcaseButton from './ShowcaseButton.svelte';
	import ShowcaseText from './ShowcaseText.svelte';

	// "Always Open Source", as just the one command that gets you the code,
	// typed into a thin outlined line when it comes into view, a cursor
	// blinking at its end.
	const REPOSITORY = 'https://gitlab.com/fuiz/website';
	const COMMAND = `git clone ${REPOSITORY}`;

	let typed = $state(COMMAND.length);
	let started = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function type() {
		typed += 1;
		if (typed < COMMAND.length) timer = setTimeout(type, 45 + Math.random() * 40);
	}

	function onVisible(visible: boolean) {
		if (!visible || started || prefersReducedMotion.current) return;
		started = true;
		typed = 0;
		timer = setTimeout(type, 400);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<section class="source">
	<ShowcaseText title={m.always_open()} description={m.always_open_desc()}>
		<ShowcaseButton href={REPOSITORY} icon={Code} label={m.view_on_gitlab()} palette={4} />
	</ShowcaseText>

	<div class="picture" aria-hidden="true" dir="ltr">
		<div class="line" {@attach inView(onVisible, 0.6)}>
			<span class="prompt">$</span>
			<span>{COMMAND.slice(0, typed)}<span class="cursor"></span></span>
		</div>
	</div>
</section>

<style>
	.source {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 3em;
		max-width: 64em;
		margin: auto;
		padding: 5em 1.5em;
	}

	@media (width <= 50em) {
		.source {
			grid-template-columns: minmax(0, 1fr);
			padding-block: 4em;
		}
	}

	.picture {
		display: flex;
		justify-content: center;
		min-width: 0;
	}

	.line {
		/* The GitLab button's purple, lifted towards the ink so it still shows
		   on the dark page. */
		--accent: color-mix(in srgb, var(--btn-bg-4) 70%, var(--on-surface));
		display: flex;
		gap: 0.7em;
		box-sizing: border-box;
		width: min(100%, 26em);
		padding: 0.9em 1.1em;
		border: 2px solid color-mix(in srgb, var(--on-surface) 28%, transparent);
		border-radius: 0.8em;
		font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: min(1em, 3.6vw);
		overflow-wrap: anywhere;
	}

	.prompt {
		color: var(--accent);
		font-weight: 700;
	}

	.cursor {
		display: inline-block;
		width: 0.55em;
		height: 1.1em;
		margin-inline-start: 0.1em;
		vertical-align: -0.2em;
		background: var(--accent);
		animation: blink 1s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cursor {
			animation: none;
		}
	}
</style>
