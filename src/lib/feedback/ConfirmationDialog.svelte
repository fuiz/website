<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import RegularCheckbox from '$lib/ui/regular-checkbox.svelte';

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

	let dialogElement = $state<HTMLDialogElement>();

	/**
	 * Opens the dialog
	 */
	export function open() {
		checked = checklist.map(() => false);
		dialogElement?.showModal();
	}

	/**
	 * Closes the dialog
	 */
	export function close() {
		dialogElement?.close();
	}

	function handleConfirm() {
		dialogElement?.close();
		onConfirm();
	}
</script>

<dialog
	bind:this={dialogElement}
	closedby="any"
	style:border="0.15em solid currentcolor"
	style:border-radius="0.7em"
	style:padding="1em"
	style:max-width="35ch"
	style:background="var(--background-color)"
	style:color="inherit"
>
	<h2 style:font-family="Poppins" style:margin="0 0 0.5em 0" style:font-size="1.25em">
		{title}
	</h2>
	{#if message.length > 0}
		<p style:margin="0 0 1em 0" style:line-height="1.4">
			{message}
		</p>
	{/if}
	{#if checklist.length > 0}
		<div style:display="flex" style:flex-direction="column" style:gap="0.5em" style:margin="0 0 1em 0">
			{#each checklist as item, i (i)}
				<button class="checklist-item" onclick={() => (checked[i] = !checked[i])}>
					<RegularCheckbox checked={checked[i]} />
					<span>{item}</span>
				</button>
			{/each}
		</div>
	{/if}
	<div
		style:display="flex"
		style:gap="0.5em"
		style:justify-content="flex-end"
		style:flex-wrap="wrap"
	>
		<div style:flex="1">
			<FancyButton
				type="button"
				backgroundColor="var(--background-color)"
				backgroundDeepColor="currentcolor"
				foregroundColor="currentcolor"
				onclick={() => dialogElement?.close()}
			>
				<div style:padding="0.25em 1em" style:white-space="nowrap">
					{cancelText}
				</div>
			</FancyButton>
		</div>
		<div style:flex="1">
			<FancyButton
				type="button"
				onclick={handleConfirm}
				disabled={!allChecked}
				backgroundColor={confirmButtonColor}
				backgroundDeepColor={confirmButtonDeepColor}
			>
				<div style:padding="0.25em 1em" style:white-space="nowrap">
					{confirmText}
				</div>
			</FancyButton>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
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
</style>
