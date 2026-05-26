<script lang="ts">
	import { Confetti } from 'svelte-confetti';
	import correct_penguin from '$lib/assets/visuals/correct_penguin.svg';
	import wrong_penguin from '$lib/assets/visuals/wrong_penguin.svg';
	import IllustratedMessage from '$lib/feedback/IllustratedMessage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name,
		score,
		correct,
		partial
	}: {
		name: string;
		score: number;
		correct: boolean;
		partial?: { picks: number; total: number };
	} = $props();
</script>

<PlayerLayout {name} {score} centered>
	<IllustratedMessage
		src={correct ? correct_penguin : wrong_penguin}
		alt={correct ? m.penguin_checkmark() : m.penguin_crossmark()}
	>
		{#if correct}
			{m.thats_correct()}
		{:else if partial}
			{m.partial_correct({ picks: partial.picks, total: partial.total })}
		{:else}
			{m.try_again()}
		{/if}
	</IllustratedMessage>
	{#if correct}
		<div class="confetti">
			<Confetti
				x={[-5, 5]}
				y={[0, 0.1]}
				delay={[500, 2000]}
				infinite
				duration={5000}
				amount={200}
				size={30}
				fallDistance="100vh"
				disableForReducedMotion={true}
			/>
		</div>
	{/if}
</PlayerLayout>

<style>
	.confetti {
		position: fixed;
		top: 0;
		left: 0;
		height: 100dvh;
		width: 100vw;
		display: flex;
		justify-content: center;
		overflow: hidden;
		pointer-events: none;
		z-index: -1;
	}
</style>
