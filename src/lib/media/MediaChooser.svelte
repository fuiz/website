<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import AddPhotoAlternateOutline from '~icons/material-symbols/add-photo-alternate-outline';
	import DeleteOutline from '~icons/material-symbols/delete-outline';
	import EditOutline from '~icons/material-symbols/edit-outline';

	let {
		media = $bindable()
	}: {
		media: Media | null | undefined;
	} = $props();

	let dragOver = $state(false);
	let editingAlt = $state(false);
	let altDraft = $state('');
	let altInput = $state<HTMLInputElement>();

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

	function startEditAlt(currentAlt: string) {
		altDraft = currentAlt;
		editingAlt = true;
	}

	function commitEditAlt() {
		if (media && 'Image' in media && 'Base64' in media.Image) {
			media.Image.Base64.alt = altDraft.trim();
		}
		editingAlt = false;
	}

	function cancelEditAlt() {
		editingAlt = false;
	}

	$effect(() => {
		if (editingAlt) altInput?.focus();
	});
</script>

{#if !media}
	<input
		class="file-input"
		type="file"
		name="image_input"
		accept="image/png, image/jpeg, image/gif, image/webp"
		id="image_input"
		onchange={load_from_input}
	/>
	<label
		for="image_input"
		class="dropzone palette-0"
		class:drag-over={dragOver}
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
		<AddPhotoAlternateOutline height="1.6em" />
		<span>{m.open_image()}</span>
	</label>
{:else if 'Image' in media}
	{#if 'Base64' in media.Image}
		{@const currentAlt = media.Image.Base64.alt}
		<div class="image-card">
			<div class="image-frame">
				<img class="image" src={media.Image.Base64.data} alt={currentAlt} />
				<button
					type="button"
					class="remove-btn"
					aria-label={m.remove()}
					onclick={() => {
						media = undefined;
						editingAlt = false;
					}}
				>
					<DeleteOutline height="1em" />
				</button>
			</div>
			{#if editingAlt}
				<input
					bind:this={altInput}
					class="alt-input"
					type="text"
					bind:value={altDraft}
					placeholder={m.image_alt()}
					onblur={commitEditAlt}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							commitEditAlt();
						} else if (e.key === 'Escape') {
							e.preventDefault();
							cancelEditAlt();
						}
					}}
				/>
			{:else}
				<button type="button" class="alt-caption" onclick={() => startEditAlt(currentAlt)}>
					<EditOutline height="0.85em" />
					<span class="alt-text">
						{#if currentAlt}
							<em>{currentAlt}</em>
						{:else}
							<span class="placeholder">{m.image_alt()}</span>
						{/if}
					</span>
				</button>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.file-input {
		display: none;
	}

	.dropzone {
		aspect-ratio: 16 / 9;
		width: 100%;
		max-width: 40ch;
		margin: 0 auto;
		background: color-mix(in srgb, var(--on-surface) 4%, transparent);
		border: 1px dashed var(--outline);
		border-radius: 0.5em;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.3em;
		font-size: 0.9em;
		color: color-mix(in srgb, currentColor 65%, transparent);
		cursor: pointer;
		transition:
			background 200ms,
			border-color 200ms,
			color 200ms;
	}

	.dropzone:hover {
		border-color: var(--primary);
		color: var(--primary);
	}

	.dropzone.drag-over {
		background: var(--btn-bg);
		border-color: #fff;
		color: #fff;
	}

	.image-card {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
		max-width: 40ch;
		min-width: 8ch;
		margin: auto;
	}

	.image-frame {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: center;
		width: fit-content;
		max-width: 100%;
		min-width: 6em;
		min-height: 6em;
		background: color-mix(in srgb, var(--on-surface) 10%, transparent);
		border-radius: 0.5em;
		overflow: hidden;
	}

	.image {
		display: block;
		max-width: 100%;
		max-height: 14em;
		width: auto;
		height: auto;
	}

	.remove-btn {
		position: absolute;
		top: 0.3em;
		right: 0.3em;
		appearance: none;
		font: inherit;
		background: rgba(0, 0, 0, 0.55);
		color: white;
		border: none;
		border-radius: 999px;
		width: 1.8em;
		height: 1.8em;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 100ms ease-out;
	}

	.remove-btn:hover {
		background: rgba(0, 0, 0, 0.75);
	}

	.alt-caption {
		appearance: none;
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		padding: 0.2em 0.3em;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.8em;
		opacity: 0.7;
		cursor: pointer;
		text-align: start;
		align-self: center;
		max-width: 100%;
		transition:
			opacity 100ms ease-out,
			color 100ms ease-out;
	}

	.alt-caption:hover {
		opacity: 1;
		color: var(--primary);
	}

	.alt-text em {
		font-style: italic;
	}

	.alt-text .placeholder {
		font-style: italic;
		opacity: 0.7;
	}

	.alt-input {
		appearance: none;
		font: inherit;
		font-size: 0.85em;
		font-style: italic;
		color: inherit;
		background: color-mix(in srgb, var(--on-surface) 4%, transparent);
		border: 1px solid var(--primary);
		border-radius: 0.35em;
		padding: 0.3em 0.5em;
		outline: none;
		align-self: stretch;
		text-align: center;
		box-sizing: border-box;
	}
</style>
