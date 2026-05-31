<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		value = $bindable(),
		min,
		max,
		children,
		onchange
	}: {
		value: number;
		min: number;
		max: number;
		children?: Snippet;
		onchange?: (value: number) => void;
	} = $props();

	function set(n: number) {
		value = n;
		onchange?.(n);
	}
</script>

<div class="group">
	<span class="label">{@render children?.()}</span>
	<div class="stepper">
		<button
			type="button"
			disabled={value <= min}
			aria-label={m.decrease()}
			onclick={() => set(value - 1)}>−</button
		>
		<span class="value">{value}</span>
		<button
			type="button"
			disabled={value >= max}
			aria-label={m.increase()}
			onclick={() => set(value + 1)}>+</button
		>
	</div>
</div>

<style>
	.group {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8em;
	}

	.label {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	.stepper button {
		appearance: none;
		background: var(--surface);
		font: inherit;
		color: inherit;
		font-family: var(--alternative-font);
		font-weight: 800;
		border: 1px solid var(--outline);
		width: 1.7em;
		height: 1.7em;
		border-radius: 999px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.stepper button:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.value {
		font-family: var(--alternative-font);
		font-weight: 800;
		min-width: 1.2em;
		text-align: center;
	}
</style>
