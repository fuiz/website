<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { grades } from '$lib/types';
	import Chip from '$lib/ui/Chip.svelte';
	import SchoolOutline from '~icons/material-symbols/school-outline';

	let { tags = $bindable() }: { tags: string[] } = $props();

	let selectedOptions = $state<[string, boolean][]>(grades.map((o) => [o, false]));

	$effect.pre(() => {
		tags = selectedOptions.filter(([, selected]) => selected).map(([option]) => option);
	});
</script>

<div class="group">
	<div class="label">
		<SchoolOutline height="1.1em" width="1.1em" />
		<span>{m.grade()}</span>
	</div>
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
</div>

<style>
	.group {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
	}

	.label {
		display: flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.85em;
		font-weight: 700;
		opacity: 0.8;
		padding-inline: 0.3em;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
	}
</style>
