<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import SwitchTrack from './SwitchTrack.svelte';

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
	<label for={id} id="{id}-label" class="text">{@render children?.()}</label>
	<SwitchTrack
		bind:checked
		disabled={stuck !== undefined}
		labelledby="{id}-label"
		{onchange}
	/>
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
</style>
