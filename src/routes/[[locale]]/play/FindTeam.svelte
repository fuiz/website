<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name,
		teamName
	}: {
		name: string;
		teamName: string;
	} = $props();
</script>

<PlayerLayout {name} centered>
	<div class="prompt">
		{m.find_team({ team: teamName })}
	</div>
</PlayerLayout>

<style>
	.prompt {
		font-weight: bold;
		font-family: var(--alternative-font);
		font-size: 1.75em;
		max-width: 12ch;
		text-align: center;
	}
</style>
