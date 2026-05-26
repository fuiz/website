<script lang="ts">
	import answered_penguin from '$lib/assets/visuals/answered_penguin.svg';
	import IllustratedMessage from '$lib/feedback/IllustratedMessage.svelte';
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
	<IllustratedMessage src={answered_penguin} alt={m.two_penguins()}>
		{m.waiting_players()}
	</IllustratedMessage>
</PlayerLayout>
