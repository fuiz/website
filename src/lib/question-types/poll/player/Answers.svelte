<script lang="ts">
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
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
				<MediaContainer {media} fit="contain" showFallback={false} />
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
	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.media {
		height: 30dvh;
		position: relative;
	}

	.answers {
		flex: 1;
		min-height: 0;
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
