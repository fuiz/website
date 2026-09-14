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
		/* Only visible in forced-colors mode, where the fill is dropped. */
		border: 1px solid transparent;
		border-radius: 0.5em;
		padding: 0.4em 0.55em;
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		background: var(--surface-container-high);
		cursor: pointer;
		transition: background 100ms ease-out;
		box-sizing: border-box;
	}

	.trigger:hover {
		background: color-mix(in srgb, var(--on-surface) 7%, var(--surface-container-high));
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
		background: var(--surface-container-high);
		border: 1px solid transparent;
		border-radius: 0.5em;
		color: inherit;
		min-width: 7em;
		box-shadow:
			0 1px 3px color-mix(in srgb, var(--shadow-color) 12%, transparent),
			0 8px 24px color-mix(in srgb, var(--shadow-color) 24%, transparent);
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
		background: var(--selected);
		font-weight: 700;
	}
</style>
