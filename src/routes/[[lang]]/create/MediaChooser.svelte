<script>
	import tippy from 'tippy.js';

	import { buttonColors } from '$lib/clientOnly';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import AddPhotoAlternateOutline from '~icons/material-symbols/add-photo-alternate-outline';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import HelpOutline from '~icons/material-symbols/help-outline';

	/** @type {{media: import('$lib/types').Media | null | undefined;}} */
	let { media = $bindable() } = $props();

	let dragOver = $state(false);

	function load_from_input() {
		const target = document.querySelector('input[type=file]');
		if (target) {
			/** @type {HTMLInputElement} */
			// @ts-expect-error we know it's an HTMLInputElement because of the querySelector
			const inputImage = target;
			loadFile(inputImage.files?.item(0) ?? undefined);
		}
	}

	/**
	 * @param {File | undefined} file
	 */
	function loadFile(file) {
		dragOver = false;
		if (file === undefined) {
			media = undefined;
			return;
		}
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.addEventListener('load', () => {
			media = {
				Image: {
					Base64: {
						data: reader.result?.toString() ?? '',
						alt: ''
					}
				}
			};
		});
	}
</script>

{#if !media}
	<div style:display="flex" style:justify-content="center">
		<input
			style:display="none"
			type="file"
			name="image_input"
			accept="image/png, image/jpeg, image/gif, image/webp"
			id="image_input"
			onchange={load_from_input}
		/>
		<button
			style:appearance="none"
			style:color="inherit"
			style:border="none"
			style:padding="none"
			style:font="inherit"
			style:background="none"
			ondragover={(e) => {
				e.preventDefault();
				dragOver = true;
			}}
			ondragenter={() => {
				dragOver = true;
			}}
			ondragleave={() => {
				dragOver = false;
			}}
			ondrop={(e) => {
				e.preventDefault();
				dragOver = false;
				const files = e.dataTransfer?.files ?? undefined;
				if (files && files.length > 0) {
					loadFile(e.dataTransfer?.files?.item(0) ?? undefined);
				}
			}}
		>
			<div
				style:aspect-ratio="1"
				style:width="2em"
				style:background={dragOver ? buttonColors[0][0] : 'transparent'}
				style:border="0.1em dashed {dragOver ? '#fff' : 'currentcolor'}"
				style:border-radius="0.2em"
				style:padding="0.2em"
				style:box-sizing="border-box"
				style:display="flex"
				style:flex-direction="column"
				style:align-items="center"
				style:gap="0.4em"
				style:transition="background 200ms"
				style:color={dragOver ? '' : 'color-mix(in srgb, currentColor 50%, transparent)'}
			>
				<label
					for="image_input"
					style:flex="1"
					style:display="flex"
					style:flex-direction="column"
					style:align-items="center"
					style:cursor="pointer"
					style:justify-content="center"
				>
					<AddPhotoAlternateOutline height="1em" title={m.open_image()} />
				</label>
			</div>
		</button>
	</div>
{:else if 'Image' in media}
	{#if 'Base64' in media.Image}
		<div
			style:display="flex"
			style:flex-direction="column"
			style:border="0.15em solid #00000040"
			style:flex="1"
			style:border-radius="0.7em"
			style:gap="0.4em"
			style:padding="0.3em"
			style:box-sizing="border-box"
			style:max-width="40ch"
			style:min-width="15ch"
			style:margin="auto"
		>
			<div style:display="flex" style:align-items="center">
				<div style:flex="1" style:text-align="center" style:font-family="Poppins">
					{m.local_image()}
				</div>
				<IconButton
					alt={m.remove()}
					onclick={() => {
						media = undefined;
					}}><DeleteOutline height="1.2em" /></IconButton
				>
			</div>
			<div
				style:flex-direction="column"
				style:align-items="stretch"
				style:display="flex"
				style:gap="0.4em"
			>
				<div
					style:width="100%"
					style:height="100%"
					style:max-width="10em"
					style:min-width="5em"
					style:position="relative"
					style:max-height="10em"
					style:display="flex"
					style:flex-direction="column"
					style:overflow="auto"
					style:margin="auto"
				>
					<MediaDisplay {media} fit="contain" />
				</div>
				<div style:display="flex" style:align-items="center" style:gap="10px">
					<div style:flex="1">
						<Textarea
							id="alt"
							required={false}
							disabled={false}
							maxHeight="5em"
							bind:value={media.Image.Base64.alt}
							placeholder={m.image_alt()}
						/>
					</div>
					<div id="alt-help">
						<IconButton
							alt={m.image_alt()}
							onclick={() => {
								let element = document.getElementById('alt-help');
								if (!element) return;
								const instance = tippy(element, {
									trigger: 'manual',
									content: m.image_alt_desc(),
									arrow: false,
									theme: 'fuiz'
								});

								instance.show();
							}}><HelpOutline height="1.2em" /></IconButton
						>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
