<script lang="ts">
	import EmptyAnswerButton from './EmptyAnswerButton.svelte';

	let {
		indices,
		onanswer
	}: {
		indices: number[];
		onanswer?: (index: number) => void;
	} = $props();
</script>

<div class="grid">
	{#each indices as index (index)}
		<EmptyAnswerButton
			{index}
			onclick={() => {
				if (onanswer) onanswer(index);
			}}
		/>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		height: 100%;
		box-sizing: border-box;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: 1fr;
		gap: 0.8em;
		padding: 0.8em;
	}
</style>
