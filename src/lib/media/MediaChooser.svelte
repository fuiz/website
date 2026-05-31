<script lang="ts">
	import { buttonColors } from '$lib/clientOnly';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import AddPhotoAlternateOutline from '~icons/material-symbols/add-photo-alternate-outline';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import HelpOutline from '~icons/material-symbols/help-outline';

	let {
		media = $bindable()
	}: {
		media: Media | null | undefined;
	} = $props();

	let dragOver = $state(false);

	function load_from_input() {
		const target = document.querySelector('input[type=file]');
		if (target) {
			// @ts-expect-error we know it's an HTMLInputElement because of the querySelector
			const inputImage: HTMLInputElement = target;
			loadFile(inputImage.files?.item(0) ?? undefined);
		}
	}

	function loadFile(file: File | undefined) {
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
	<div class="empty-wrap">
		<input
			class="file-input"
			type="file"
			name="image_input"
			accept="image/png, image/jpeg, image/gif, image/webp"
			id="image_input"
			onchange={load_from_input}
		/>
		<button
			class="upload-button"
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
			<div class="dropzone" class:drag-over={dragOver} style:--drag-bg={buttonColors[0][0]}>
				<label class="upload-label" for="image_input">
					<AddPhotoAlternateOutline height="1em" title={m.open_image()} />
				</label>
			</div>
		</button>
	</div>
{:else if 'Image' in media}
	{#if 'Base64' in media.Image}
		<div class="image-card">
			<div class="image-header">
				<div class="image-title">{m.local_image()}</div>
				<IconButton
					alt={m.remove()}
					onclick={() => {
						media = undefined;
					}}
				>
					<DeleteOutline height="1.2em" />
				</IconButton>
			</div>
			<div class="image-body">
				<div class="image-preview">
					<MediaDisplay {media} fit="contain" />
				</div>
				<div class="alt-row">
					<div class="alt-input">
						<Textarea
							id="alt"
							required={false}
							disabled={false}
							maxHeight="5em"
							bind:value={media.Image.Base64.alt}
							placeholder={m.image_alt()}
						/>
					</div>
					<div>
						<IconButton alt={m.image_alt()} popovertarget="alt-help-popover">
							<HelpOutline height="1.2em" />
						</IconButton>
						<div id="alt-help-popover" popover class="fuiz-popover">{m.image_alt_desc()}</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.empty-wrap {
		display: flex;
		justify-content: center;
	}

	.file-input {
		display: none;
	}

	.upload-button {
		appearance: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		background: none;
	}

	.dropzone {
		aspect-ratio: 1;
		width: 2em;
		background: transparent;
		border: 1px dashed var(--outline);
		border-radius: 0.2em;
		padding: 0.2em;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4em;
		color: color-mix(in srgb, currentColor 50%, transparent);
		transition:
			background 200ms,
			border-color 200ms,
			color 200ms;
	}

	.dropzone.drag-over {
		background: var(--drag-bg);
		border-color: #fff;
		color: inherit;
	}

	.upload-label {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		justify-content: center;
	}

	.image-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--outline);
		flex: 1;
		border-radius: 0.7em;
		gap: 0.4em;
		padding: 0.3em;
		box-sizing: border-box;
		max-width: 40ch;
		min-width: 15ch;
		margin: auto;
	}

	.image-header {
		display: flex;
		align-items: center;
	}

	.image-title {
		flex: 1;
		text-align: center;
		font-family: var(--alternative-font);
	}

	.image-body {
		flex-direction: column;
		align-items: stretch;
		display: flex;
		gap: 0.4em;
	}

	.image-preview {
		width: 100%;
		height: 100%;
		max-width: 10em;
		min-width: 5em;
		position: relative;
		max-height: 10em;
		display: flex;
		flex-direction: column;
		overflow: auto;
		margin: auto;
	}

	.alt-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.alt-input {
		flex: 1;
	}
</style>
