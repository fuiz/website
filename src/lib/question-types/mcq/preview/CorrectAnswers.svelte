<script lang="ts">
	import type { MultipleChoiceSlide } from '$lib/types';

	let { slide }: { slide: MultipleChoiceSlide } = $props();
</script>

<ul>
	{#each slide.answers.filter((a) => a.correct) as answer (answer.id)}
		<li>{answer.content.Text}</li>
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
