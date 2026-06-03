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

	// Lift the leaving slide to a fixed overlay so it doesn't stack below the
	// incoming question in flow — no visible change here, so the topbar stays put
	// while the announcement's pieces fly out within it (see Spotlight). Stays
	// fixed long enough to cover the pieces' flight.
	function lift(_node: HTMLElement, { duration = 580 } = {}) {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return { duration: 0 };
		return { duration, css: () => 'position: fixed; inset: 0; z-index: 5;' };
	}
</script>

<div class="exit-wrap" out:lift>
	<HostLayout bind:bindableGameInfo {gameInfo} {onlock} {onnext}>
		<AnnouncementContent {questionType} {pointsAwarded} />
	</HostLayout>
</div>

<style>
	.exit-wrap {
		height: 100%;
	}
</style>
