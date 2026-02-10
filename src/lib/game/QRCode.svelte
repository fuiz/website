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
		src={image}
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
			src={image}
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

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.63);
	}
</style>
