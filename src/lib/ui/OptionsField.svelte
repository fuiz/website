<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		id,
		label,
		options,
		selected = $bindable(),
		map,
		leading
	}: {
		id: string;
		label: string;
		options: readonly T[];
		selected: T | undefined;
		map: (value: T) => string;
		leading?: Snippet;
	} = $props();

	let popoverEl = $state<HTMLDivElement>();
</script>

<button class="trigger" type="button" popovertarget={id} style:anchor-name="--{id}">
	<div class="label">{label}</div>
	<div class="value">
		{@render leading?.()}
		<span>{selected === undefined ? '' : map(selected)}</span>
	</div>
</button>

<div
	bind:this={popoverEl}
	{id}
	popover="auto"
	class="dropdown"
	style:position-anchor="--{id}"
>
	{#each options as opt, i (i)}
		<button
			type="button"
			class="opt"
			class:selected={opt === selected}
			onclick={() => {
				selected = opt;
				popoverEl?.hidePopover();
			}}
		>
			{map(opt)}
		</button>
	{/each}
</div>

<style>
	.trigger {
		appearance: none;
		font: inherit;
		color: inherit;
		text-align: start;
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		padding: 0.4em 0.55em;
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		background: color-mix(in srgb, var(--on-surface) 2%, transparent);
		cursor: pointer;
		transition:
			border-color 100ms ease-out,
			background 100ms ease-out;
		box-sizing: border-box;
	}

	.trigger:hover {
		border-color: color-mix(in srgb, var(--on-surface) 35%, transparent);
		background: color-mix(in srgb, var(--on-surface) 5%, transparent);
	}

	.label {
		font-size: 0.65em;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.6;
	}

	.value {
		display: flex;
		align-items: center;
		gap: 0.3em;
		font-size: 1em;
		font-weight: 600;
	}

	.dropdown {
		position: fixed;
		position-area: bottom span-right;
		position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		inset: unset;
		margin: 0.3em 0;
		padding: 0.3em;
		background: var(--surface);
		border: 1px solid var(--outline);
		border-radius: 0.5em;
		color: inherit;
		min-width: 7em;
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
		position-area: bottom span-left;
	}

	.dropdown::backdrop {
		background: transparent;
	}

	.opt {
		appearance: none;
		font: inherit;
		color: inherit;
		background: none;
		border: 1px solid transparent;
		border-radius: 0.4em;
		padding: 0.3em 0.55em;
		text-align: start;
		cursor: pointer;
		transition: background 80ms ease-out;
	}

	.opt:hover {
		background: color-mix(in srgb, var(--on-surface) 8%, transparent);
	}

	.opt.selected {
		border-color: color-mix(in srgb, var(--primary) 60%, transparent);
		color: var(--primary);
	}
</style>
