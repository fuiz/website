<script lang="ts">
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name,
		score
	}: {
		name: string;
		score: number;
	} = $props();
</script>

<PlayerLayout {name} {score} centered>
	<FeedbackSign variant="waiting-others">
		{m.waiting_players()}
	</FeedbackSign>
</PlayerLayout>
