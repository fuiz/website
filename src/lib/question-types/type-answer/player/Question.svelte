<script lang="ts">
	import { env } from '$env/dynamic/public';
	import TextBar from '$lib/game/TextBar.svelte';
	import ZoomableImage from '$lib/media/ZoomableImage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';

	let value = $state('');

	let {
		name,
		score,
		questionText,
		media,
		onanswer
	}: {
		name: string;
		score: number;
		questionText: string;
		media: Media | undefined;
		onanswer: (answer: string) => void;
	} = $props();
</script>

<svelte:head>
	{#if media && 'Corkboard' in media.Image}
		<link
			rel="preload"
			as="image"
			href={env.PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id}
		/>
	{/if}
</svelte:head>

<PlayerLayout {name} {score}>
	<div class="content">
		{#if media}
			<div class="media">
				<ZoomableImage {media} />
			</div>
		{/if}
		<TextBar text={questionText} />
		<form
			onsubmit={(e) => {
				e.preventDefault();
				onanswer(value);
			}}
		>
			<Textfield id="answer" placeholder={m.answer_text()} required disabled={false} bind:value />
			<div class="submit">
				<FancyButton onclick={() => onanswer(value)}>{m.submit()}</FancyButton>
			</div>
		</form>
	</div>
</PlayerLayout>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	/* Up to 40vh; gives up height before the rest is squeezed, down to 20dvh. */
	.media {
		flex: 0 1 40vh;
		min-height: 20dvh;
		padding: 0.5em;
		box-sizing: border-box;
	}

	form {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75em;
		width: 300px;
		max-width: 300px;
		margin: 0 auto;
		box-sizing: content-box;
	}

	.submit {
		width: 100%;
	}
</style>
