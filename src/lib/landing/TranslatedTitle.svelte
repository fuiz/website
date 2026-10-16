<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { Locale } from '$lib/paraglide/runtime';
	import { texts } from './localeCycle.svelte';

	// The title in every language, stacked in one spot and sized to the
	// longest, so changing which one shows never moves anything around it.
	let { shown, center = false }: { shown: Locale; center?: boolean } = $props();
</script>

<h2 class="sr-only">{m.well_translated()}</h2>
<div class="stack" class:center aria-hidden="true">
	{#each texts as text (text.locale)}
		<span class="title" class:shown={text.locale === shown} lang={text.locale} dir="auto">
			{text.title}
		</span>
	{/each}
</div>

<style>
	.stack {
		display: grid;
		align-items: center;
		font-family: var(--alternative-font);
		font-size: clamp(1.9em, 4.5vw, 2.8em);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.02em;
		hyphens: auto;
		overflow-wrap: anywhere;
	}

	.center {
		text-align: center;
	}

	.title {
		grid-area: 1 / 1;
		text-wrap: balance;
		visibility: hidden;
		opacity: 0;
		translate: 0 0.3em;
		transition:
			opacity 300ms ease-out,
			translate 300ms ease-out,
			visibility 0s 300ms;
	}

	.title.shown {
		visibility: visible;
		opacity: 1;
		translate: 0 0;
		transition:
			opacity 350ms ease-out 120ms,
			translate 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 120ms,
			visibility 0s;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
