<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The words beside a landing-page scene: a large title, a line of
	 * description, and optionally the calls to action.
	 */
	let {
		title,
		description,
		center = false,
		children
	}: {
		title: string;
		description: string;
		center?: boolean;
		children?: Snippet;
	} = $props();
</script>

<div class="text" class:center>
	<h2>{title}</h2>
	<p>{description}</p>
	{#if children}
		<div class="actions">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.8em;
		text-align: start;
	}

	.center {
		align-items: center;
		text-align: center;
	}

	h2 {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: clamp(1.9em, 4.5vw, 2.8em);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	p {
		margin: 0;
		max-width: 38ch;
		font-size: 1.1em;
		line-height: 1.4;
		opacity: 0.8;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8em;
		margin-top: 0.4em;
		font-size: 1.1em;
	}
</style>
