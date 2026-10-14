<script lang="ts">
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name
	}: {
		name: string;
	} = $props();
</script>

<PlayerLayout {name} centered>
	<FeedbackSign variant="waiting-host">
		{m.waiting_host()}
	</FeedbackSign>
</PlayerLayout>
