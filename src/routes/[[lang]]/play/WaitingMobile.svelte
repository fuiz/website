<script lang="ts">
	import waiting_penguin from '$lib/assets/visuals/waiting.svg';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name
	}: {
		name: string;
	} = $props();
</script>

<PlayerLayout {name} centered>
	<div class="content">
		<img class="penguin" src={waiting_penguin} alt={m.penguin_waiting()} />
		<div class="caption">
			{m.waiting_host()}
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
