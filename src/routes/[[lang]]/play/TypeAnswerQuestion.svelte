<script>
	import { PUBLIC_CORKBOARD_URL } from '$env/static/public';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Topbar from './Topbar.svelte';

	let value = $state('');

	/** @type {{name: string;score: number;questionText: string;media: import('$lib/types').Media | undefined;onanswer: (answer: string) => void;}} */
	let { name, score, questionText, media, onanswer } = $props();
</script>

<svelte:head>
	{#if media && 'Corkboard' in media.Image}
		<link
			rel="preload"
			as="image"
			href={PUBLIC_CORKBOARD_URL + '/get/' + media.Image.Corkboard.id}
		/>
	{/if}
</svelte:head>

<div style:display="flex" style:flex-direction="column" style:height="100%">
	<Topbar {name} {score} />
	<NiceBackground>
		<div style:height="100%" style:display="flex" style:flex-direction="column">
			{#if media}
				<div style:height="40vh" style:padding="0.5em" style:box-sizing="border-box">
					<div style:position="relative" style:height="100%">
						<MediaContainer {media} fit="contain" />
					</div>
				</div>
			{/if}
			<TextBar text={questionText} topShadow={(media ?? undefined) !== undefined} />
			<div
				style:display="flex"
				style:padding="0.5em"
				style:flex-direction="column"
				style:align-items="center"
				style:width="min(100%, 20ch)"
				style:margin="auto"
				style:justify-content="center"
				style:flex="1"
				style:box-sizing="border-box"
			>
				<Textfield id="answer" placeholder={m.answer_text()} required disabled={false} bind:value />
				<div style:width="100%">
					<FancyButton onclick={() => onanswer(value)}>{m.submit()}</FancyButton>
				</div>
			</div>
		</div>
	</NiceBackground>
</div>
