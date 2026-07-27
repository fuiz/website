<script lang="ts">
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	// The results screen for opinion slides. There is no right answer to react
	// to, so instead of a verdict the player gets an acknowledgement while the
	// room looks at the aggregate on the host's screen.
	let {
		name,
		score
	}: {
		name: string;
		score: number;
	} = $props();
</script>

<PlayerLayout {name} {score} centered>
	<FeedbackSign variant="waiting-host" captionMaxWidth="16ch">
		{m.answer_recorded()}
	</FeedbackSign>
</PlayerLayout>
