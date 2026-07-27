<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		width = 'min(35ch, calc(100vw - 2em))',
		onclose
	}: {
		children: Snippet;
		/** CSS width for the dialog. Wide content (a picker grid, say) can ask
		 *  for more room than the default single-column reading width. */
		width?: string;
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

<dialog bind:this={dialogElement} closedby="any" style:--modal-width={width} {onclose}>
	{@render children()}
</dialog>

<style>
	dialog {
		opacity: 0;
		scale: 0.97;
		transition:
			opacity 0.15s ease,
			scale 0.15s ease,
			overlay 0.15s allow-discrete,
			display 0.15s allow-discrete;
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		padding: 1em;
		margin: auto;
		width: var(--modal-width);
		max-height: calc(100dvh - 2em);
		/* Tall content (the slide picker) scrolls inside the dialog rather than
		   spilling past it. */
		overflow-y: auto;
		box-sizing: border-box;
		background: var(--surface);
		color: inherit;
		box-shadow:
			0 1px 2px color-mix(in srgb, var(--on-surface) 8%, transparent),
			0 4px 12px color-mix(in srgb, var(--on-surface) 12%, transparent);
	}

	dialog[open] {
		opacity: 1;
		scale: 1;
	}

	@starting-style {
		dialog[open] {
			opacity: 0;
			scale: 0.97;
		}
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition:
			opacity 0.15s ease,
			overlay 0.15s allow-discrete,
			display 0.15s allow-discrete;
	}

	dialog[open]::backdrop {
		opacity: 1;
	}

	@starting-style {
		dialog[open]::backdrop {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		dialog,
		dialog::backdrop {
			transition-duration: 0.01ms;
		}
	}
</style>
