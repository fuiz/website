<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { subjects } from '$lib/types';

	let { tags = $bindable() }: { tags: string[] } = $props();

	let selectedOptions = $state<[string, boolean][]>(subjects.map((o) => [o, false]));

	$effect.pre(() => {
		tags = selectedOptions.filter(([, selected]) => selected).map(([option]) => option);
	});
</script>

<fieldset>
	<legend>{m.subject()}</legend>
	<div class="chips">
		{#each selectedOptions as [option, selected], index (option)}
			<label class:selected>
				<input type="checkbox" bind:checked={selectedOptions[index][1]} />
				{option}
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		border: 2px solid #a9a8aa;
		border-radius: 10px;
		padding: 0.3em 0.4em;
		margin: 0;
	}

	legend {
		color: color-mix(in srgb, currentColor 50%, transparent);
		padding: 0 0.25em;
		font-size: 0.75em;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25em;
	}

	input {
		display: none;
	}

	label {
		border: 0.1em solid color-mix(in srgb, currentColor 40%, transparent);
		border-radius: 2em;
		padding: 0.1em 0.5em;
		font-size: 0.65em;
		cursor: pointer;
		transition:
			background 200ms ease,
			color 200ms ease,
			border-color 200ms ease;
		user-select: none;
	}

	label:hover {
		background: color-mix(in srgb, currentColor 10%, transparent);
	}

	label.selected {
		background: var(--accent-color);
		color: var(--palette-light);
		border-color: var(--accent-color);
	}
</style>
