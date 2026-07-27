<script lang="ts">
	import PinBoard from '$lib/game/PinBoard.svelte';
	import type { IdlessPinSlide } from '$lib/types';

	let {
		slide,
		showAnswers
	}: {
		slide: IdlessPinSlide;
		showAnswers: boolean;
	} = $props();
</script>

<div class="preview">
	<PinBoard
		media={slide.media}
		shape={slide.correct_area ?? undefined}
		showShape={showAnswers && slide.correct_area != null}
	/>
</div>

<style>
	.preview {
		flex-shrink: 0;
		height: 6em;
		padding: 0.3em;
		box-sizing: border-box;
	}
</style>
