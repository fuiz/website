<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import RegularCheckbox from '$lib/ui/regular-checkbox.svelte';
	import Modal from './Modal.svelte';

	let {
		title,
		message,
		cancelText = m.cancel(),
		confirmText,
		onConfirm,
		confirmButtonColor,
		confirmButtonDeepColor,
		checklist = []
	}: {
		title: string;
		message: string;
		cancelText?: string;
		confirmText: string;
		onConfirm: () => void;
		confirmButtonColor?: string;
		confirmButtonDeepColor?: string;
		checklist?: string[];
	} = $props();

	let checked = $state<boolean[]>([]);

	let allChecked = $derived(checked.every(Boolean));

	let modal = $state<Modal>();

	/**
	 * Opens the dialog
	 */
	export function open() {
		checked = checklist.map(() => false);
		modal?.open();
	}

	/**
	 * Closes the dialog
	 */
	export function close() {
		modal?.close();
	}

	function handleConfirm() {
		modal?.close();
		onConfirm();
	}
</script>

<Modal bind:this={modal}>
	<h2 class="title">
		{title}
	</h2>
	{#if message.length > 0}
		<p class="message">
			{message}
		</p>
	{/if}
	{#if checklist.length > 0}
		<div class="checklist">
			{#each checklist as item, i (i)}
				<button class="checklist-item" onclick={() => (checked[i] = !checked[i])}>
					<RegularCheckbox checked={checked[i]} />
					<span>{item}</span>
				</button>
			{/each}
		</div>
	{/if}
	<div class="actions">
		<div class="action">
			<FancyButton
				type="button"
				backgroundColor="var(--surface)"
				backgroundDeepColor="currentcolor"
				foregroundColor="currentcolor"
				onclick={close}
			>
				<div class="action-label">
					{cancelText}
				</div>
			</FancyButton>
		</div>
		<div class="action">
			<FancyButton
				type="button"
				onclick={handleConfirm}
				disabled={!allChecked}
				backgroundColor={confirmButtonColor}
				backgroundDeepColor={confirmButtonDeepColor}
			>
				<div class="action-label">
					{confirmText}
				</div>
			</FancyButton>
		</div>
	</div>
</Modal>

<style>
	.title {
		font-family: var(--alternative-font);
		margin: 0 0 0.5em 0;
		font-size: 1.25em;
	}

	.message {
		margin: 0 0 1em 0;
		line-height: 1.4;
	}

	.checklist {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin: 0 0 1em 0;
	}

	.checklist-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5em;
		cursor: pointer;
		line-height: 1.4;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: start;
	}

	.actions {
		display: flex;
		gap: 0.5em;
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.action {
		flex: 1;
	}

	.action-label {
		padding: 0.25em 1em;
		white-space: nowrap;
	}
</style>
