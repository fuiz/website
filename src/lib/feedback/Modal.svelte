<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		onclose
	}: {
		children: Snippet;
		onclose?: () => void;
	} = $props();

	let dialogElement = $state<HTMLDialogElement>();

	export function open() {
		dialogElement?.showModal();
	}

	export function close() {
		dialogElement?.close();
	}
</script>

<dialog bind:this={dialogElement} closedby="any" {onclose}>
	{@render children()}
</dialog>

<style>
	dialog {
		border: none;
		border-radius: 0.7em;
		padding: 1em;
		margin: auto;
		width: min(35ch, calc(100vw - 2em));
		max-height: calc(100dvh - 2em);
		box-sizing: border-box;
		background: var(--surface);
		color: inherit;
		box-shadow: 0 0.5em 1.5em #00000060;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
