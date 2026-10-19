<script lang="ts">
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media } from '$lib/types';

	let {
		questionText,
		name,
		score,
		media,
		answers,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: Media | undefined;
		answers: string[];
		showAnswers: boolean;
		onanswer: (index: number) => void;
	} = $props();
</script>

<PlayerLayout {name} {score}>
	{#snippet belowTopbar()}
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	{/snippet}
	<div class="stack">
		{#if media && showAnswers}
			<div class="media">
				<ZoomableImage {media} />
			</div>
		{/if}
		<div class="answers">
			{#each answers as answer, index (index)}
				<TextAnswerButton
					answerText={showAnswers ? answer : ''}
					{index}
					correct={undefined}
					onclick={() => onanswer(index)}
				/>
			{/each}
		</div>
	</div>
</PlayerLayout>

<style>
	/* Scrolls only when the image at its smallest and the answers can't both fit. */
	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	/* Up to 30dvh; gives up height before the answers are squeezed, down to 20dvh. */
	.media {
		flex: 0 1 30dvh;
		min-height: 20dvh;
	}

	.answers {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 0.5em;
		padding: 0.5em;
		font-size: 1.1em;
	}

	@media (max-width: 420px) {
		.answers {
			grid-template-columns: 1fr;
		}
	}
</style>
