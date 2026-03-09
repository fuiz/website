<script lang="ts">
	import EmptyAnswerButton from './EmptyAnswerButton.svelte';

	let {
		indices,
		selected,
		onanswer
	}: {
		indices: number[];
		selected?: Set<number>;
		onanswer?: (index: number) => void;
	} = $props();
</script>

<div
	style:display="grid"
	style:height="100%"
	style:box-sizing="border-box"
	style:grid-template-columns="1fr 1fr"
	style:gap="0.8em"
	style:padding="0.8em"
>
	{#each indices as index (index)}
		<EmptyAnswerButton
			{index}
			selected={selected?.has(index)}
			onclick={() => {
				if (onanswer) onanswer(index);
			}}
		/>
	{/each}
</div>
