<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { FreeTextSlide } from '$lib/types';

	let { slide }: { slide: FreeTextSlide } = $props();
</script>

<div class="summary">
	{slide.mode === 'WordCloud' ? m.word_cloud() : m.open_ended()}
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
