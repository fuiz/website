<script lang="ts">
	import { env } from '$env/dynamic/public';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { Media } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Topbar from '../../../../routes/[[lang]]/play/Topbar.svelte';

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

<div class="page">
	<Topbar {name} {score} />
	<NiceBackground>
		<div class="body">
			{#if media}
				<div class="media">
					<div class="media-inner">
						<MediaContainer {media} fit="contain" />
					</div>
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
	</NiceBackground>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.body {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.media {
		height: 40vh;
		padding: 0.5em;
		box-sizing: border-box;
	}

	.media-inner {
		position: relative;
		height: 100%;
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
