<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import Close from '~icons/custom/close';
	import { getImageInfo } from './imageInfo';
	import MediaFallback from './MediaFallback.svelte';

	let {
		media,
		hug = false
	}: {
		media: Media;
		/**
		 * Size to the image's own shape at full width instead of filling the parent; the parent
		 * then sets limits with min-height and max-height.
		 */
		hug?: boolean;
	} = $props();

	let info = $derived(getImageInfo(media));

	let dialogElement = $state<HTMLDialogElement>();
</script>

{#if info}
	<button
		type="button"
		class="thumb"
		class:hug
		title={m.enlarge_image()}
		onclick={() => dialogElement?.showModal()}
	>
		<img class="thumb-img" alt={info.alt} src={info.src} />
	</button>

	<!-- The viewer covers the whole screen, so there is no "outside" for closedby to catch:
	     taps on the dark surround (the dialog itself, not the image) close it instead. The
	     image itself stays put so pinch-zooming it doesn't dismiss the viewer. -->
	<dialog
		bind:this={dialogElement}
		class="viewer"
		closedby="any"
		onclick={(e) => {
			if (e.target === dialogElement) dialogElement.close();
		}}
	>
		<img class="full" alt={info.alt} src={info.src} />
		<button
			type="button"
			class="close"
			title={m.close()}
			onclick={() => dialogElement?.close()}
		>
			<Close height="1em" width="1em" aria-hidden="true" />
		</button>
	</dialog>
{:else}
	<MediaFallback />
{/if}

<style>
	.thumb {
		appearance: none;
		border: none;
		background: none;
		font: inherit;
		color: inherit;
		padding: 0;
		height: 100%;
		width: 100%;
		display: flex;
		cursor: zoom-in;
	}

	/* Out of flow by default, so the image never props its box open: the parent can shrink
	   the box under pressure and the image shrinks with it. */
	.thumb:not(.hug) {
		position: relative;
	}

	.thumb:not(.hug) .thumb-img {
		position: absolute;
		inset: 0;
	}

	.thumb-img {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}

	.viewer {
		border: none;
		padding: 0;
		margin: 0;
		width: 100vw;
		height: 100dvh;
		max-width: none;
		max-height: none;
		box-sizing: border-box;
		background: rgba(0, 0, 0, 0.9);
		opacity: 0;
		transition:
			opacity 0.15s ease,
			overlay 0.15s allow-discrete,
			display 0.15s allow-discrete;
	}

	.viewer[open] {
		display: flex;
		opacity: 1;
	}

	@starting-style {
		.viewer[open] {
			opacity: 0;
		}
	}

	.viewer::backdrop {
		background: none;
	}

	.full {
		margin: auto;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.close {
		position: absolute;
		top: 0.5em;
		inset-inline-end: 0.5em;
		appearance: none;
		border: none;
		font: inherit;
		font-size: 1.5em;
		display: flex;
		padding: 0.4em;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.6);
		color: #ffffff;
		cursor: pointer;
	}

	@media (prefers-reduced-motion: reduce) {
		.viewer {
			transition-duration: 0.01ms;
		}
	}
</style>
