<script lang="ts">
	import RegularCheckbox from '$lib/ui/regular-checkbox.svelte';
	import { grades } from '$lib/types';

	let { tags = $bindable() }: { tags: string[] } = $props();

	let selectedOptions = $state<[string, boolean][]>(grades.map((o) => [o, false]));

	$effect.pre(() => {
		tags = selectedOptions.filter(([, selected]) => selected).map(([option]) => option);
	});
</script>

Grade:
<div id="container">
	{#each selectedOptions as [option, selected], index (option)}
		<label>
			<input type="checkbox" bind:checked={selectedOptions[index][1]} style:display="none" />
			<RegularCheckbox checked={selected} />
			{option}
		</label>
	{/each}
</div>

<style>
	#container {
		display: grid;
		grid: auto-flow / repeat(auto-fill, minmax(10em, 1fr));
		row-gap: 0.25em;
	}

	label {
		display: flex;
		align-items: start;
		gap: 0.25em;
	}
</style>
