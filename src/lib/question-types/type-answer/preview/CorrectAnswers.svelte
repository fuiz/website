<script lang="ts">
	import type { TypeAnswer } from '$lib/types';

	let { slide }: { slide: TypeAnswer } = $props();
</script>

<ul>
	{#each slide.answers as answer (answer.id)}
		<li>{answer.text}</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding-inline-start: 1.4em;
		font-size: 0.95em;
	}
</style>
