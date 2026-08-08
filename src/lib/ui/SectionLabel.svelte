<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The small uppercase caption that names the block beside or below it:
	 * QUESTION 3, TEAMS, EXPORT.
	 *
	 * Carries typography and nothing else. Spacing belongs to whatever is being
	 * labelled, so a caller sets `--section-label-margin` or
	 * `--section-label-padding` on any ancestor and it inherits down, rather than
	 * every call site redeclaring the same six font properties.
	 */
	let {
		as = 'div',
		trailing,
		children
	}: {
		/** Tag to render, for when the label is also the section's heading. */
		as?: 'div' | 'span' | 'h2' | 'h3';
		/** Right-aligned companion on the same line, such as a count or a hint. */
		trailing?: Snippet;
		children: Snippet;
	} = $props();
</script>

<svelte:element this={as} class="section-label" class:split={trailing !== undefined}>
	<span>{@render children()}</span>
	{#if trailing}
		{@render trailing()}
	{/if}
</svelte:element>

<style>
	.section-label {
		font-family: var(--alternative-font);
		font-size: 0.75em;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
		margin: var(--section-label-margin, 0);
		padding: var(--section-label-padding, 0);
	}

	.split {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5em;
	}
</style>
