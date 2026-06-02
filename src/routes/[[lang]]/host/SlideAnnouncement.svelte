<script lang="ts">
	import AnnouncementContent from '$lib/question-types/announcement/AnnouncementContent.svelte';
	import HostLayout from '$lib/question-types/host/HostLayout.svelte';
	import type { BindableGameInfo, SharedGameInfo } from '$lib/question-types/host/types';
	import type { QuestionType } from '$lib/types';

	// Splash for the `Unstarted` phase: announces the upcoming question's type and
	// scoring before the question is revealed, with an intro animation.
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionType,
		pointsAwarded,
		onlock,
		onnext
	}: {
		bindableGameInfo: BindableGameInfo;
		gameInfo: SharedGameInfo;
		questionType: QuestionType;
		pointsAwarded: number;
		onlock?: (locked: boolean) => void;
		onnext?: () => void;
	} = $props();
</script>

<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
	<AnnouncementContent {questionType} {pointsAwarded} />
</HostLayout>
