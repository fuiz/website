<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { QuestionType } from '$lib/types';
	import Spotlight from './scenes/Spotlight.svelte';

	// The `Unstarted`-phase splash: announces the upcoming question's type (and
	// points, when notable) with an intro animation.
	let {
		questionType,
		pointsAwarded
	}: {
		questionType: QuestionType;
		pointsAwarded: number;
	} = $props();

	// Same labels the create sidebar uses for each slide type.
	const label = $derived(
		questionType === 'MultipleChoice'
			? m.multiple_choice()
			: questionType === 'TypeAnswer'
				? m.short_answer()
				: m.puzzle()
	);
</script>

<div class="announcement">
	<Spotlight {questionType} {label} {pointsAwarded} />
</div>

<style>
	.announcement {
		height: 100%;
		width: 100%;
		position: relative;
		overflow: hidden;
		color: var(--on-surface);
		/* Size container the scene scales against — full-screen on host/play,
		   thumbnail-sized in the demo grid. */
		container-type: size;
		container-name: announce;
	}
</style>
