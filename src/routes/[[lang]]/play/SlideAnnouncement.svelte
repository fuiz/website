<script lang="ts">
	import AnnouncementContent from '$lib/question-types/announcement/AnnouncementContent.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { QuestionType } from '$lib/types';

	// Splash for the `Unstarted` phase: announces the upcoming question's type and
	// scoring before the question is revealed, with an intro animation.
	let {
		name,
		score,
		questionType,
		pointsAwarded
	}: {
		name: string;
		score: number;
		questionType: QuestionType;
		pointsAwarded: number;
	} = $props();
</script>

<PlayerLayout {name} {score}>
	<AnnouncementContent {questionType} {pointsAwarded} />
</PlayerLayout>
