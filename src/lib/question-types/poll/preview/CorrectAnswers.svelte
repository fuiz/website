<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { PollSlide } from '$lib/types';

	let { slide }: { slide: PollSlide } = $props();
</script>

<ul>
	{#each slide.answers as answer (answer.id)}
		<li>{answer.content.Text}</li>
	{/each}
</ul>
<div class="note">{m.opinion_no_correct()}</div>

<style>
	ul {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding-inline-start: 1.4em;
		font-size: 0.95em;
	}

	.note {
		font-size: 0.8em;
		font-style: italic;
		opacity: 0.6;
	}
</style>
