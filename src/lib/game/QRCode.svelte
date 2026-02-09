<script>
	import { toDataURL } from 'qrcode';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import * as m from '$lib/paraglide/messages.js';

	/** @type {{url: string;smallSize: string;}} */
	let { url, smallSize } = $props();

	let image = $derived(toDataURL(url, { scale: 1 }));

	/** @type {HTMLDialogElement | undefined} */
	let dialogElement = $state();
</script>

{#await image}
	<div
		style:height={smallSize}
		style:width={smallSize}
		style:display="flex"
		style:justify-content="center"
		style:align-items="center"
		style:border-radius="0.2em"
	>
		<div style:height="64px" style:width="64px">
			<LoadingCircle borderWidth={8} />
		</div>
	</div>
{:then url}
	<button
		onclick={() => dialogElement?.showModal()}
		style:font="inherit"
		style:appearance="none"
		style:border="none"
		style:background="none"
		style:padding="0"
		style:display="flex"
		style:cursor="pointer"
	>
		<img
			src={url}
			style:height={smallSize}
			style:width={smallSize}
			alt={m.qr_code()}
			style:image-rendering="pixelated"
			style:border-radius="0.2em"
		/>
	</button>

	<dialog
		bind:this={dialogElement}
		closedby="any"
		style:border="none"
		style:background="transparent"
		style:padding="0"
		style:max-width="none"
		style:max-height="none"
	>
		<button
			onclick={() => dialogElement?.close()}
			style:appearance="none"
			style:border="none"
			style:font="inherit"
			style:box-sizing="border-box"
			style:background="none"
			style:padding="0"
			style:cursor="pointer"
		>
			<img
				src={url}
				style:margin="auto"
				style:height="80vmin"
				style:width="auto"
				style:aspect-ratio="1"
				style:max-height="700px"
				alt={m.qr_code()}
				style:image-rendering="pixelated"
				style:border-radius="5px"
			/>
		</button>
	</dialog>
{/await}

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.63);
	}
</style>
