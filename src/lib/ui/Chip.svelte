<script lang="ts">
	import type { Snippet } from 'svelte';
	import Close from '~icons/custom/close';

	let {
		selected = false,
		removable = false,
		size = 'md',
		ariaLabel,
		onclick,
		children
	}: {
		selected?: boolean;
		removable?: boolean;
		size?: 'sm' | 'md';
		ariaLabel?: string;
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

<button
	type="button"
	class="chip"
	class:selected
	class:sm={size === 'sm'}
	aria-label={ariaLabel}
	aria-pressed={selected ? 'true' : 'false'}
	{onclick}
>
	<span class="touch"></span>
	<span class="outline"></span>
	<span class="bg"></span>
	<span class="cell">
		{#if !removable}
			<span class="icon">
				<svg viewBox="0 0 18 18" aria-hidden="true">
					<path
						d="M6.75012 12.1274L3.62262 8.99988L2.55762 10.0574L6.75012 14.2499L15.7501 5.24988L14.6926 4.19238L6.75012 12.1274Z"
					/>
				</svg>
			</span>
		{/if}
		<span class="label">{@render children()}</span>
		{#if removable}
			<span class="trailing">
				<Close height="1.125em" width="1.125em" aria-hidden="true" />
			</span>
		{/if}
	</span>
</button>

<style>
	.chip {
		position: relative;
		appearance: none;
		font: inherit;
		color: inherit;
		background: transparent;
		border: none;
		border-radius: 8px;
		height: 2em;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		-webkit-tap-highlight-color: transparent;
	}

	.chip.sm {
		font-size: 0.85em;
	}

	.touch {
		position: absolute;
		inset: 50% 0 0;
		height: 48px;
		transform: translateY(-50%);
		width: 100%;
	}

	.outline,
	.bg {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
	}

	.outline {
		border: 1px solid var(--outline);
		box-sizing: border-box;
		transition:
			border-color 100ms cubic-bezier(0.2, 0, 0, 1),
			border-width 100ms cubic-bezier(0.2, 0, 0, 1);
	}

	.chip.selected .outline {
		border-width: 0;
	}

	.bg {
		background: color-mix(in srgb, var(--primary) 18%, var(--surface));
		opacity: 0;
		transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
	}

	.chip.selected .bg {
		opacity: 1;
	}

	.chip::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: transparent;
		pointer-events: none;
		transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1);
	}

	.chip:hover::after {
		background: color-mix(in srgb, var(--on-surface) 8%, transparent);
	}

	.chip:active::after {
		background: color-mix(in srgb, var(--on-surface) 12%, transparent);
	}

	.chip.selected:hover::after {
		background: color-mix(in srgb, var(--primary) 8%, transparent);
	}

	.chip.selected:active::after {
		background: color-mix(in srgb, var(--primary) 12%, transparent);
	}

	.cell {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		height: 100%;
		padding-inline: 1em 1em;
		transition: padding 200ms cubic-bezier(0.2, 0, 0, 1);
	}

	.chip.selected .cell {
		padding-inline-start: 0.5em;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		width: 0;
		overflow: hidden;
		transition:
			width 200ms cubic-bezier(0.2, 0, 0, 1),
			margin-inline-end 200ms cubic-bezier(0.2, 0, 0, 1);
		color: var(--on-surface);
	}

	.chip.selected .icon {
		width: 1.125em;
		margin-inline-end: 0.5em;
	}

	.icon svg {
		width: 1.125em;
		height: 1.125em;
		flex-shrink: 0;
		fill: currentColor;
	}

	.label {
		color: var(--on-surface-variant);
		white-space: nowrap;
		transition: color 100ms cubic-bezier(0.2, 0, 0, 1);
	}

	.chip.selected .label {
		color: var(--on-surface);
	}

	.trailing {
		display: inline-flex;
		align-items: center;
		margin-inline-start: 0.5em;
		color: var(--on-surface-variant);
	}
</style>
