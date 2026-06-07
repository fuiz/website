<script lang="ts">
	import AnnouncementContent from '$lib/question-types/announcement/AnnouncementContent.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { AnswerMode, QuestionType } from '$lib/types';

	// Splash for the `Unstarted` phase: announces the upcoming question's type and
	// scoring before the question is revealed, with an intro animation.
	let {
		name,
		score,
		questionType,
		answerMode,
		pointsAwarded
	}: {
		name: string;
		score: number;
		questionType: QuestionType;
		// For multiple choice: whether players pick one or several answers.
		answerMode?: AnswerMode;
		pointsAwarded: number;
	} = $props();

	// Lift the leaving splash to a fixed overlay so it doesn't stack below the
	// incoming question in flow; its pieces fly out within (see Spotlight). Stays
	// fixed long enough to cover the staggered flight.
	function lift(_node: HTMLElement, { duration = 580 } = {}) {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return { duration: 0 };
		return { duration, css: () => 'position: fixed; inset: 0; z-index: 5;' };
	}
</script>

<div class="exit-wrap" out:lift>
	<PlayerLayout {name} {score}>
		<AnnouncementContent {questionType} {answerMode} {pointsAwarded} />
	</PlayerLayout>
</div>

<style>
	.exit-wrap {
		height: 100%;
	}
</style>
