<script lang="ts">
	import answered_penguin from '$lib/assets/visuals/answered_penguin.svg';
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
	<div class="content">
		<img class="penguin" src={answered_penguin} alt={m.two_penguins()} />
		<div class="caption">
			{m.waiting_players()}
		</div>
	</div>
</PlayerLayout>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.penguin {
		width: 10em;
	}

	.caption {
		font-weight: bold;
		max-width: 10ch;
		text-align: center;
	}
</style>
