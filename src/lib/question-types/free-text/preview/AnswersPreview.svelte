<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { IdlessFreeTextSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: IdlessFreeTextSlide;
	} = $props();
</script>

<div class="preview">
	<span class="text">
		{slide.mode === 'WordCloud'
			? m.word_cloud_preview({ count: slide.max_entries })
			: m.open_ended_preview()}
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
