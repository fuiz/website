<script lang="ts">
	import waiting_penguin from '$lib/assets/visuals/waiting.svg';
	import IllustratedMessage from '$lib/feedback/IllustratedMessage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name
	}: {
		name: string;
	} = $props();
</script>

<PlayerLayout {name} centered>
	<IllustratedMessage src={waiting_penguin} alt={m.penguin_waiting()}>
		{m.waiting_host()}
	</IllustratedMessage>
</PlayerLayout>
