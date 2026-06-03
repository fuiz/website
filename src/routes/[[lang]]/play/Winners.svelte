<script lang="ts">
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name,
		score,
		isWinner,
		winners
	}: {
		name: string;
		score: number;
		isWinner: boolean;
		winners: string[];
	} = $props();

	const formatter = new Intl.ListFormat(getLocale(), { style: 'long', type: 'conjunction' });
</script>

<PlayerLayout {name} {score} centered>
	<FeedbackSign variant={isWinner ? 'correct' : 'wrong'} captionMaxWidth="20ch">
		{#if isWinner}
			{m.congrats()}
			{m.list_won({
				winners: formatter.format(['You'].concat(winners.filter((x) => x !== name)))
			})}
		{:else}
			{m.try_again()}
			{m.list_won({
				winners: formatter.format(winners)
			})}
		{/if}
	</FeedbackSign>
</PlayerLayout>
