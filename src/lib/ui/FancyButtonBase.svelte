<script lang="ts">
	import type { Snippet } from 'svelte';
	import { type Palette, paletteClass } from '$lib/clientOnly';

	let {
		palette,
		disabled = false,
		active = true,
		type = undefined,
		height = undefined,
		children,
		onclick
	}: {
		palette?: Palette;
		disabled?: boolean;
		active?: boolean;
		type?: 'button' | 'submit' | 'reset';
		height?: string;
		children?: Snippet;
		onclick?: () => void;
	} = $props();
</script>

{#snippet body()}
	<div class="back">
		<div class="front">
			{@render children?.()}
		</div>
	</div>
{/snippet}

{#if active}
	<button
		{type}
		class={['root', paletteClass(palette)]}
		class:disabled
		style:height={height ?? 'fit-content'}
		disabled={disabled || !active}
		onclick={() => {
			if (onclick) onclick();
		}}
	>
		{@render body()}
	</button>
{:else}
	<div
		class={['root', paletteClass(palette)]}
		class:disabled
		style:height={height ?? 'fit-content'}
	>
		{@render body()}
	</div>
{/if}

<style>
	.root {
		display: flex;
		background: none;
		border: none;
		color: inherit;
		box-sizing: border-box;
		padding: 0.3em 0 0 0;
		width: 100%;
		font: inherit;
		outline: none;
	}

	.root.disabled {
		--btn-bg: #737373;
		--btn-deep: #636363;
	}

	.back {
		background: var(--btn-deep, color-mix(in srgb, var(--primary) 80%, black));
		transition: background 300ms linear;
		border-radius: 0.7em;
		transform: translateY(0);
		width: 100%;
		height: 100%;
	}

	.front {
		background-color: var(--btn-bg, var(--primary));
		border: 0.1em solid var(--btn-deep, color-mix(in srgb, var(--primary) 80%, black));
		border-radius: 0.7em;
		box-sizing: border-box;
		color: var(--btn-fg, #ffffff);
		width: 100%;
		height: 100%;
		transform: translateY(-0.15em);
		transition:
			transform 150ms,
			background-color 300ms linear,
			border-color 300ms linear;
	}

	.root:active:not(:disabled) .front {
		transform: translateY(0);
	}

	.root:where(:global(:hover, :focus)) .front {
		transform: translateY(-0.3em);
	}
</style>
