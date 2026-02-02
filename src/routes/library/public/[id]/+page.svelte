<script>
	import * as m from '$lib/paraglide/messages.js';

	import TypicalPage from '$lib/TypicalPage.svelte';
	import Icon from '$lib/Icon.svelte';
	import MediaContainer from '$lib/MediaContainer.svelte';
	import FancyButton from '$lib/FancyButton.svelte';
	import { goto } from '$app/navigation';
	import { addCreation, generateUuid, loadDatabase } from '$lib/storage';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { assertUnreachable, buttonColors } from '$lib';

	let { data } = $props();

	let fuiz = $derived(data.fuiz);

	let config = $derived(data.config);

	/**
	 * @returns {Promise<number>}
	 */
	async function addToCollection() {
		const db = await loadDatabase();
		const id = await addCreation(
			{
				lastEdited: Date.now(),
				uniqueId: generateUuid(),
				versionId: 0,
				config
			},
			db
		);

		return id;
	}

	async function onImport() {
		const id = await addToCollection();
		await goto(localizeHref('/create') + '?id=' + id.toString());
	}

	async function onStart() {
		const id = await addToCollection();
		await goto(localizeHref('/host') + '?id=' + id.toString());
	}
</script>

<TypicalPage>
	<div id="page">
		<div id="start-pane">
			<div id="summary">
				<div class="image-container">
					{#if fuiz.thumbnail}
						<img src={fuiz.thumbnail} alt={fuiz.thumbnail_alt} />
					{:else}
						<div
							style:width="100%"
							style:display="flex"
							style:align-items="center"
							style:justify-content="center"
						>
							<Icon src="$lib/assets/image.svg" size="2em" alt={m.fallback()} />
						</div>
					{/if}
				</div>
				<div class="info">
					<div class="title">
						{fuiz.title}
					</div>
					<div>
						{m.author()}: {fuiz.author}
					</div>
					<div>
						{m.language()}: {new Intl.DisplayNames([getLocale()], {
							type: 'language'
						}).of(fuiz.language)}
					</div>
				</div>
			</div>
			<FancyButton onclick={onImport}>
				<div style:font-family="Poppins">{m.import_fuiz()}</div>
			</FancyButton>
			<FancyButton
				onclick={onStart}
				backgroundColor={buttonColors[1][0]}
				backgroundDeepColor={buttonColors[1][1]}
			>
				<div style:font-family="Poppins">{m.host()}</div>
			</FancyButton>
		</div>
		<div
			style:flex="3"
			style:display="flex"
			style:flex-direction="column"
			style:gap="0.5em"
			style:height="fit-content"
		>
			{#each config.slides as slide}
				{@const { title, answers, media } = ((slide) => {
					switch (true) {
						case 'MultipleChoice' in slide:
							return slide.MultipleChoice;
						case 'TypeAnswer' in slide:
							return slide.TypeAnswer;
						case 'Order' in slide:
							return slide.Order;
						default:
							return assertUnreachable(slide);
					}
				})(slide)}
				<div
					style:border="0.15em solid"
					style:border-radius="0.7em"
					style:overflow="hidden"
					style:flex-wrap="wrap"
					style:display="flex"
					style:justify-content="center"
				>
					{#if media}
						<div style:position="relative" style:width="6em" style:min-height="4em">
							<MediaContainer {media} fit="cover" />
						</div>
					{/if}
					<div style:min-width="fit-content" style:padding="0.2em" style:flex="1">
						{title}
						<ul>
							{#each answers as answer}
								{#if typeof answer === 'string'}
									<li>{answer}</li>
								{:else}
									<li>{answer.content.Text}, {answer.correct ? m.correct() : m.wrong()}</li>
								{/if}
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</div>
</TypicalPage>

<style>
	.image-container {
		flex: 1;
		overflow: hidden;
		display: flex;
		min-height: 6em;
		border-bottom: 0.15em solid;
	}

	img {
		width: 100%;
		height: auto;
		flex: 1;
		object-fit: cover;
	}

	ul {
		margin: 0;
	}

	.title {
		font-weight: bold;
	}

	#start-pane {
		display: flex;
		flex-direction: column;
		max-width: 30ch;
		flex: 1;
		gap: 0.5em;
		min-width: fit-content;
		height: fit-content;
	}

	#summary {
		display: flex;
		flex-direction: column;
		max-width: 30ch;
		flex: 1;
		border: 0.15em solid;
		border-radius: 0.7em;
		overflow: hidden;
		min-width: fit-content;
		height: fit-content;
	}

	.info {
		padding: 0.5em;
	}

	#page {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5em;
	}
</style>
