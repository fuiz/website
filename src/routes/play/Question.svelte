<script>
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import { PUBLIC_CORKBOARD_URL } from '$env/static/public';
	import MediaContainer from '$lib/media/MediaContainer.svelte';

	/** @type {{name: string;score: number;questionText: string;media: import('$lib/types').Media | undefined;}} */
	let { name, score, questionText, media } = $props();
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
		<div
			style:height="100%"
			style:display="flex"
			style:flex-direction="column"
			style:justify-content="start"
		>
			{#if media}
				<div style:height="40vh" style:padding="0.5em" style:box-sizing="border-box">
					<div style:position="relative" style:height="100%">
						<MediaContainer {media} fit="contain" />
					</div>
				</div>
			{/if}
			<TextBar text={questionText} topShadow={true} />
		</div>
	</NiceBackground>
</div>
