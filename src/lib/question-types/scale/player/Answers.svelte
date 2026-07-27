<script lang="ts">
	import ScalePicker from '$lib/game/ScalePicker.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media, ScaleLabels, ScaleStyle } from '$lib/types';

	let {
		questionText,
		name,
		score,
		media,
		points,
		labels,
		style,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: Media | undefined;
		points: number[];
		labels: ScaleLabels;
		style: ScaleStyle;
		showAnswers: boolean;
		onanswer: (value: number) => void;
	} = $props();

	let selected = $state<number | undefined>(undefined);
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
		<div class="content" class:dense={style === 'Nps'}>
			<ScalePicker
				{points}
				{labels}
				{style}
				{selected}
				interactive
				onpick={(value) => {
					selected = value;
					onanswer(value);
				}}
			/>
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
		height: 35dvh;
		position: relative;
	}

	.content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 1.2em;
		font-size: 1.15em;
	}

	.content.dense {
		font-size: 1em;
		padding: 0.8em;
	}
</style>
