<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { IdlessBrainstormSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: IdlessBrainstormSlide;
	} = $props();
</script>

<div class="preview">
	<span class="text">
		{m.brainstorm_preview({
			ideas: slide.max_ideas_per_player,
			votes: slide.max_votes_per_player
		})}
	</span>
</div>

<style>
	.preview {
		flex-shrink: 0;
		margin: 0.4em;
		padding: 0.4em 0.6em;
		border: 1px dashed color-mix(in srgb, var(--on-surface) 30%, transparent);
		border-radius: 0.5em;
		min-height: 1.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85em;
	}

	.text {
		opacity: 0.75;
		text-align: center;
	}
</style>
