<script lang="ts">
	import type { IdlessInfoSlide } from '$lib/types';

	let {
		slide
	}: {
		slide: IdlessInfoSlide;
	} = $props();
</script>

{#if slide.body}
	<div class="preview">
		<span class="text">{slide.body}</span>
	</div>
{/if}

<style>
	.preview {
		flex-shrink: 0;
		margin: 0.4em;
		padding: 0.3em 0.5em;
		font-size: 0.8em;
	}

	.text {
		opacity: 0.75;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
