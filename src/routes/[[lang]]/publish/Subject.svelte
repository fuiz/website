<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { subjects } from '$lib/types';
	import Chip from '$lib/ui/Chip.svelte';

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
			<Chip
				size="sm"
				{selected}
				onclick={() => {
					selectedOptions[index][1] = !selected;
				}}
			>
				{option}
			</Chip>
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
</style>
