<script lang="ts">
	import { Confetti } from 'svelte-confetti';
	import correct_penguin from '$lib/assets/visuals/correct_penguin.svg';
	import wrong_penguin from '$lib/assets/visuals/wrong_penguin.svg';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';

	let {
		name,
		score,
		correct
	}: {
		name: string;
		score: number;
		correct: boolean;
	} = $props();
</script>

<PlayerLayout {name} {score} centered>
	<div class="card">
		<img
			class="penguin"
			src={correct ? correct_penguin : wrong_penguin}
			alt={correct ? m.penguin_checkmark() : m.penguin_crossmark()}
		/>
		<div class="caption">
			{#if correct}
				{m.thats_correct()}
			{:else}
				{m.try_again()}
			{/if}
		</div>
	</div>
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
	.card {
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
