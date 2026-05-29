<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import Check from '~icons/custom/check';

	let {
		checked = $bindable(),
		id,
		stuck = undefined,
		children,
		onchange
	}: {
		checked: boolean;
		id: string;
		stuck?: boolean;
		children?: Snippet;
		onchange?: (boolean: boolean) => void;
	} = $props();

	const onInput: FormEventHandler<HTMLInputElement> = (e) => {
		if (stuck === undefined) {
			/* @ts-expect-error target will be HTMLInputElement, the type system doesn't know */
			const target: HTMLInputElement | null = e?.target ?? null;
			checked = target?.checked ?? checked;
			onchange?.(checked);
		}
	};
</script>

<div class="group" class:disabled={stuck !== undefined}>
	<input
		{id}
		type="checkbox"
		role="switch"
		{checked}
		disabled={stuck !== undefined}
		oninput={onInput}
	/>
	<label for={id} class="text">{@render children?.()}</label>
	<button
		type="button"
		class="track"
		data-on={checked}
		aria-labelledby={id}
		disabled={stuck !== undefined}
		onclick={() => {
			if (stuck === undefined) {
				checked = !checked;
				onchange?.(checked);
			}
		}}
	>
		<span class="handle-container">
			<span class="handle">
				{#if checked}
					<Check height="0.7em" width="0.7em" />
				{/if}
			</span>
		</span>
	</button>
</div>

<style>
	.group {
		display: flex;
		align-items: center;
	}

	input {
		display: none;
	}

	.text {
		flex: 1;
		padding-inline-end: 0.5em;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.group.disabled .text {
		opacity: 0.5;
	}

	.track {
		appearance: none;
		font: inherit;
		color: inherit;
		margin: 0;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5em;
		height: 1.4em;
		border: 0.1em solid var(--outline);
		border-radius: 999px;
		background: var(--surface-variant);
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
		width: 0.7em;
		height: 0.7em;
		border-radius: 999px;
		background: var(--outline);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--on-primary-container);
		transition: width 250ms cubic-bezier(0.2, 0, 0, 1),
			height 250ms cubic-bezier(0.2, 0, 0, 1), background-color 67ms linear;
	}
	.track[data-on='true'] .handle {
		width: 1.1em;
		height: 1.1em;
		background: var(--on-primary);
	}
	.track:active:not(:disabled) .handle {
		width: 1.3em;
		height: 1.3em;
		transition-duration: 100ms, 100ms, 67ms;
		transition-timing-function: linear, linear, linear;
	}
</style>
