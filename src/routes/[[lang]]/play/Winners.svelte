<script lang="ts">
	import correct_penguin from '$lib/assets/visuals/correct_penguin.svg';
	import wrong_penguin from '$lib/assets/visuals/wrong_penguin.svg';
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
	<div class="card">
		<img
			class="penguin"
			src={isWinner ? correct_penguin : wrong_penguin}
			alt={isWinner ? m.penguin_checkmark() : m.penguin_crossmark()}
		/>
		<div class="caption">
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
		</div>
	</div>
</PlayerLayout>

<style>
	.card {
		display: flex;
		flex-direction: column;
		padding: 0.4em;
		align-items: center;
	}

	.penguin {
		width: 10em;
	}

	.caption {
		font-weight: bold;
		max-width: 20ch;
		text-align: center;
	}
</style>
