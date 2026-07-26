<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	let {
		correct,
		wrong,
		unanswered
	}: {
		correct: number;
		wrong: number;
		unanswered: number;
	} = $props();

	let total = $derived(Math.max(1, correct + wrong + unanswered));
</script>

<div
	class="bar"
	role="img"
	aria-label="{correct} {m.correct()}, {wrong} {m.wrong()}, {unanswered} {m.unanswered()}"
>
	<span class="segment correct" style:--share="{(correct / total) * 100}%"></span>
	<span class="segment wrong" style:--share="{(wrong / total) * 100}%"></span>
	<span class="segment unanswered" style:--share="{(unanswered / total) * 100}%"></span>
</div>

<style>
	.bar {
		display: flex;
		height: 0.4em;
		border-radius: 999px;
		overflow: hidden;
		background: color-mix(in srgb, var(--on-surface) 12%, transparent);
	}

	.segment {
		width: var(--share);
	}

	.correct {
		background: var(--correct);
	}

	.wrong {
		background: var(--incorrect);
	}

	.unanswered {
		background: color-mix(in srgb, var(--on-surface) 20%, transparent);
	}
</style>
