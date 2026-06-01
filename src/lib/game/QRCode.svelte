<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { qrcodegen } from '$lib/qrcodegen';

	let { url, smallSize }: { url: string; smallSize: string } = $props();

	function toSvgString(
		qr: qrcodegen.QrCode,
		border: number,
		lightColor: string,
		darkColor: string
	): string {
		if (border < 0) throw new RangeError('Border must be non-negative');
		let parts: Array<string> = [];
		for (let y = 0; y < qr.size; y++) {
			for (let x = 0; x < qr.size; x++) {
				if (qr.getModule(x, y)) parts.push(`M${x + border},${y + border}h1v1h-1z`);
			}
		}
		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${qr.size + border * 2} ${qr.size + border * 2}" stroke="none">
	<rect width="100%" height="100%" fill="${lightColor}"/>
	<path d="${parts.join(' ')}" fill="${darkColor}"/>
</svg>
`;
	}

	function svgToDataUri(svg: string): string {
		return `data:image/svg+xml;base64,${btoa(svg)}`;
	}

	let image = $derived(
		svgToDataUri(
			toSvgString(
				qrcodegen.QrCode.encodeText(url, qrcodegen.QrCode.Ecc.MEDIUM),
				4,
				'#ffffff',
				'#000000'
			)
		)
	);

	let dialogElement = $state<HTMLDialogElement>();
</script>

<button class="thumb" style:--small-size={smallSize} onclick={() => dialogElement?.showModal()}>
	<img class="thumb-img" src={image} alt={m.qr_code()} />
</button>

<dialog class="modal" bind:this={dialogElement} closedby="any">
	<button class="modal-btn" onclick={() => dialogElement?.close()}>
		<img class="modal-img" src={image} alt={m.qr_code()} />
	</button>
</dialog>

<style>
	.thumb {
		font: inherit;
		appearance: none;
		border: none;
		background: none;
		padding: 0;
		display: flex;
		cursor: pointer;
	}

	.thumb-img {
		height: var(--small-size);
		width: var(--small-size);
		image-rendering: pixelated;
		border-radius: 0.2em;
	}

	.modal {
		border: none;
		background: transparent;
		padding: 0;
		max-width: none;
		max-height: none;
	}

	.modal-btn {
		appearance: none;
		border: none;
		font: inherit;
		box-sizing: border-box;
		background: none;
		padding: 0;
		cursor: pointer;
	}

	.modal-img {
		margin: auto;
		height: 80vmin;
		width: auto;
		aspect-ratio: 1;
		max-height: 700px;
		image-rendering: pixelated;
		border-radius: 5px;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.63);
	}
</style>
