<script lang="ts">
	import { Confetti } from 'svelte-confetti';
	import FeedbackSign from '$lib/feedback/FeedbackSign.svelte';
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
	<FeedbackSign variant={correct ? 'correct' : 'wrong'}>
		{#if correct}
			{m.thats_correct()}
		{:else}
			{m.try_again()}
		{/if}
	</FeedbackSign>
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
