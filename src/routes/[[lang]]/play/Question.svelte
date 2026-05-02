<script lang="ts">
	import { env } from '$env/dynamic/public';
	import TextBar from '$lib/game/TextBar.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import type { Media } from '$lib/types';
	import Topbar from './Topbar.svelte';

	let {
		name,
		score,
		questionText,
		media
	}: {
		name: string;
		score: number;
		questionText: string;
		media: Media | undefined;
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
			<TextBar text={questionText} />
		</div>
	</NiceBackground>
</div>
