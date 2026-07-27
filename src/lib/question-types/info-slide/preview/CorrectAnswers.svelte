<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { InfoSlide } from '$lib/types';

	let { slide }: { slide: InfoSlide } = $props();
</script>

{#if slide.body}
	<p class="body">{slide.body}</p>
{/if}
<div class="note">{m.info_slide_note()}</div>

<style>
	.body {
		margin: 0;
		font-size: 0.9em;
		white-space: pre-wrap;
	}

	.note {
		font-size: 0.8em;
		font-style: italic;
		opacity: 0.6;
	}
</style>
