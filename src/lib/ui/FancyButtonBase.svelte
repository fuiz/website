<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		foregroundColor,
		backgroundColor,
		backgroundDeepColor,
		disabled = false,
		active = true,
		type = undefined,
		height = undefined,
		children,
		onclick
	}: {
		foregroundColor: string;
		backgroundColor: string;
		backgroundDeepColor: string;
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
		class="root"
		class:disabled
		style:--bg={backgroundColor}
		style:--bg-deep={backgroundDeepColor}
		style:--fg={foregroundColor}
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
		class="root"
		class:disabled
		style:--bg={backgroundColor}
		style:--bg-deep={backgroundDeepColor}
		style:--fg={foregroundColor}
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

	.disabled {
		--bg: #737373;
		--bg-deep: #636363;
	}

	.back {
		background: var(--bg-deep);
		transition: background 300ms linear;
		border-radius: 0.7em;
		transform: translateY(0);
		width: 100%;
		height: 100%;
	}

	.front {
		background-color: var(--bg);
		border: 0.1em solid var(--bg-deep);
		border-radius: 0.7em;
		box-sizing: border-box;
		color: var(--fg);
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
