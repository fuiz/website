<script lang="ts">
	import type { OrderSlide } from '$lib/types';

	let { slide }: { slide: OrderSlide } = $props();
</script>

{#if slide.axis_labels.from}
	<div class="axis-label">{slide.axis_labels.from}</div>
{/if}
<ol>
	{#each slide.answers as answer (answer.id)}
		<li>{answer.text}</li>
	{/each}
</ol>
{#if slide.axis_labels.to}
	<div class="axis-label">{slide.axis_labels.to}</div>
{/if}

<style>
	ol {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding-inline-start: 1.4em;
		font-size: 0.95em;
	}

	.axis-label {
		font-size: 0.85em;
		font-style: italic;
		opacity: 0.7;
	}
</style>
