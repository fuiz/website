<script lang="ts">
	import type { Component } from 'svelte';

	/**
	 * The track and handle of a Material 3 switch, on its own. {@link Switch}
	 * puts a label beside it; used bare, it needs `label` for its name.
	 *
	 * With icons, the handle keeps its selected size in both states, as Material
	 * 3 does for a handle that carries content.
	 */
	let {
		checked = $bindable(),
		disabled = false,
		label = undefined,
		labelledby = undefined,
		onIcon = undefined,
		offIcon = undefined,
		onchange
	}: {
		checked: boolean;
		disabled?: boolean;
		/** Accessible name and tooltip, when nothing visible names the switch. */
		label?: string;
		/** Id of the element that names the switch. */
		labelledby?: string;
		/** Shown in the handle while on. */
		onIcon?: Component;
		/** Shown in the handle while off. */
		offIcon?: Component;
		onchange?: (checked: boolean) => void;
	} = $props();

	let Icon = $derived(checked ? onIcon : offIcon);
</script>

<button
	type="button"
	role="switch"
	class="track"
	class:with-icons={onIcon !== undefined || offIcon !== undefined}
	data-on={checked}
	aria-checked={checked}
	aria-label={label}
	aria-labelledby={labelledby}
	title={label}
	{disabled}
	onclick={() => {
		checked = !checked;
		onchange?.(checked);
	}}
>
	<span class="handle-container">
		<span class="handle">
			{#if Icon}
				<Icon height="0.7em" width="0.7em" />
			{/if}
		</span>
	</span>
</button>

<style>
	.track {
		appearance: none;
		font: inherit;
		color: inherit;
		margin: 0;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 2.5em;
		height: 1.4em;
		border: 0.1em solid var(--outline);
		border-radius: 999px;
		background: var(--surface-container-high);
		box-sizing: border-box;
		transition: background-color 67ms linear;
	}
	.track[data-on='true'] {
		background: var(--primary);
		border-color: transparent;
	}
	.track:disabled {
		cursor: default;
		opacity: 0.5;
	}
	.track:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.handle-container {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: margin 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
		margin-inline-end: 1.1em;
	}
	.track[data-on='true'] .handle-container {
		margin-inline-start: 1.1em;
		margin-inline-end: 0;
	}

	.handle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 0.7em;
		height: 0.7em;
		border-radius: 999px;
		background: var(--on-surface-variant);
		color: var(--surface-container-high);
		transition: width 250ms cubic-bezier(0.2, 0, 0, 1),
			height 250ms cubic-bezier(0.2, 0, 0, 1), background-color 67ms linear, color 67ms linear;
	}
	.track[data-on='true'] .handle,
	.track.with-icons .handle {
		width: 1.1em;
		height: 1.1em;
	}
	/* The icon takes the track's color, not Material's on-primary-container:
	   here the handle is always white, and that pairing loses contrast. */
	.track[data-on='true'] .handle {
		background: var(--on-primary);
		color: var(--primary);
	}
	.track:active:not(:disabled) .handle {
		width: 1.3em;
		height: 1.3em;
		transition-duration: 100ms, 100ms, 67ms, 67ms;
		transition-timing-function: linear, linear, linear, linear;
	}
</style>
