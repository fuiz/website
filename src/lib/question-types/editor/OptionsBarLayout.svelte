<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The per-slide settings rail. It sits beside the editor on a desktop and
	 * turns into a horizontally scrolling strip above it on a phone, so a slide
	 * with many options never squeezes the editing area.
	 */
	let { children }: { children: Snippet } = $props();
</script>

<div class="options-container">
	<div class="options">
		{@render children()}
	</div>
</div>

<style>
	.options {
		width: 11em;
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		padding: 0.4em;
		background: var(--surface-container-low);
		height: 100%;
		box-sizing: border-box;
	}

	@media only screen and (max-width: 900px) {
		.options {
			overflow-x: auto;
			width: auto;
			flex-direction: row;
		}

		.options > :global(*) {
			min-width: max-content;
			flex-shrink: 0;
		}

		.options-container {
			min-width: 100%;
			width: 0px;
		}
	}
</style>
