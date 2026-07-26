<script lang="ts">
	import type { Component } from 'svelte';
	import MoreVert from '~icons/material-symbols/more-vert';

	export type OverflowItem = {
		label: string;
		icon?: Component;
		/** Destructive items sort last and sit below a rule, in the error colour. */
		danger?: boolean;
		onclick: () => void;
	};

	let {
		id,
		label,
		items
	}: {
		id: string;
		label: string;
		items: OverflowItem[];
	} = $props();

	let popoverEl = $state<HTMLDivElement>();

	let ordered = $derived([...items.filter((i) => !i.danger), ...items.filter((i) => i.danger)]);
	let firstDanger = $derived(ordered.findIndex((i) => i.danger));
</script>

<button
	class="trigger"
	type="button"
	popovertarget={id}
	style:anchor-name="--{id}"
	title={label}
	aria-label={label}
>
	<MoreVert height="1.1em" width="1.1em" />
</button>

<div bind:this={popoverEl} {id} popover="auto" class="dropdown" style:position-anchor="--{id}">
	{#each ordered as item, index (item.label)}
		{#if index === firstDanger && index > 0}
			<hr />
		{/if}
		<button
			type="button"
			class="item"
			class:danger={item.danger}
			onclick={() => {
				popoverEl?.hidePopover();
				item.onclick();
			}}
		>
			{#if item.icon}
				<item.icon height="1em" width="1em" />
			{/if}
			<span>{item.label}</span>
		</button>
	{/each}
</div>

<style>
	.trigger {
		appearance: none;
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		border-radius: 0.4em;
		padding: 0.25em;
		display: flex;
		align-items: center;
		cursor: pointer;
		opacity: 0.7;
		transition:
			opacity 100ms ease-out,
			background 100ms ease-out;
	}

	.trigger:where(:hover, :focus-visible) {
		opacity: 1;
		background: color-mix(in srgb, var(--on-surface) 10%, transparent);
	}

	.dropdown {
		position: fixed;
		position-area: bottom span-left;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		inset: unset;
		margin: 0.3em 0;
		padding: 0.3em;
		background: var(--surface);
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		color: inherit;
		min-width: 9em;
		box-shadow:
			0 1px 2px color-mix(in srgb, var(--on-surface) 8%, transparent),
			0 4px 12px color-mix(in srgb, var(--on-surface) 12%, transparent);
	}

	.dropdown:popover-open {
		display: flex;
		flex-direction: column;
		gap: 0.1em;
	}

	.dropdown:dir(rtl) {
		position-area: bottom span-right;
	}

	.item {
		appearance: none;
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		border-radius: 0.35em;
		padding: 0.4em 0.5em;
		display: flex;
		align-items: center;
		gap: 0.5em;
		text-align: start;
		cursor: pointer;
		white-space: nowrap;
	}

	.item:where(:hover, :focus-visible) {
		background: color-mix(in srgb, var(--on-surface) 8%, transparent);
	}

	.item.danger {
		color: var(--primary);
	}

	hr {
		border: none;
		border-top: 1px solid var(--outline);
		margin: 0.2em 0.1em;
	}
</style>
