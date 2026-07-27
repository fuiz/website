<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { BrainstormSlide } from '$lib/types';

	let { slide }: { slide: BrainstormSlide } = $props();
</script>

<div class="summary">
	{m.brainstorm_preview({
		ideas: slide.max_ideas_per_player,
		votes: slide.max_votes_per_player
	})}
</div>
<div class="note">{m.opinion_no_correct()}</div>

<style>
	.summary {
		font-size: 0.95em;
	}

	.note {
		font-size: 0.8em;
		font-style: italic;
		opacity: 0.6;
	}
</style>
