<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { assertUnreachable } from '$lib';
	import { buttonColors } from '$lib/clientOnly';
	import TextBar from '$lib/game/TextBar.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import { getImageInfo } from '$lib/media/imageInfo';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { addCreation, generateUuid, loadDatabase } from '$lib/storage';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/custom/check';
	import ImageOutline from '~icons/material-symbols/image-outline';
	import VisibilityOff from '~icons/material-symbols/visibility-off-outline';
	import Visibility from '~icons/material-symbols/visibility-outline';

	let { data } = $props();

	let fuiz = $derived(data.fuiz);

	let config = $derived(data.config);

	let showAnswers = $state(false);

	async function addToCollection(): Promise<number> {
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
		await goto(resolve(localizeHref('/create') + '?id=' + id.toString()));
	}

	async function onStart() {
		const id = await addToCollection();
		await goto(resolve(localizeHref('/host') + '?id=' + id.toString()));
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
							<ImageOutline height="2em" width="2em" title={m.fallback()} />
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
				<div style:font-family="var(--alternative-font)">{m.import_fuiz()}</div>
			</FancyButton>
			<FancyButton
				onclick={onStart}
				backgroundColor={buttonColors[1][0]}
				backgroundDeepColor={buttonColors[1][1]}
			>
				<div style:font-family="var(--alternative-font)">{m.host()}</div>
			</FancyButton>
		</div>
		<div class="slides-pane">
			<div class="slides-toolbar">
				<button
					type="button"
					class="reveal-toggle"
					onclick={() => (showAnswers = !showAnswers)}
				>
					{#if showAnswers}
						<VisibilityOff height="1.1em" width="1.1em" />
					{:else}
						<Visibility height="1.1em" width="1.1em" />
					{/if}
					{showAnswers ? m.hide_answers() : m.show_answers()}
				</button>
			</div>
			<div class="slides-grid">
				{#each config.slides as slide, index (index)}
					{@const title = ((slide) => {
						switch (true) {
							case 'MultipleChoice' in slide:
								return slide.MultipleChoice.title;
							case 'TypeAnswer' in slide:
								return slide.TypeAnswer.title;
							case 'Order' in slide:
								return slide.Order.title;
							default:
								return assertUnreachable(slide);
						}
					})(slide)}
					{@const media = ((slide) => {
						switch (true) {
							case 'MultipleChoice' in slide:
								return slide.MultipleChoice.media;
							case 'TypeAnswer' in slide:
								return slide.TypeAnswer.media;
							case 'Order' in slide:
								return slide.Order.media;
							default:
								return assertUnreachable(slide);
						}
					})(slide)}
					<div class="slide-card">
						<div class="slide-title">
							<TextBar text={title} />
						</div>
						<div class="slide-media">
							{#if media}
								{@const info = getImageInfo(media)}
								{#if info}
									<img class="media-img" src={info.src} alt={info.alt} />
								{/if}
							{/if}
						</div>

						{#if 'TypeAnswer' in slide}
							<div class="slide-typeanswer">
								{#if showAnswers}
									<span class="typeanswer-text"
										>{slide.TypeAnswer.answers.join(' · ')}</span
									>
								{/if}
							</div>
						{:else if 'Order' in slide}
							<div class="slide-order">
								{#if slide.Order.axis_labels.from}
									<div class="axis-label">{slide.Order.axis_labels.from}</div>
								{/if}
								{#each slide.Order.answers as answer, answerIndex (answerIndex)}
									{@const color = buttonColors.at(answerIndex % buttonColors.length)}
									<div
										class="bar"
										style:background-color={color?.[0]}
										style:border-color={color?.[1]}
									>
										<span class="bar-num">{answerIndex + 1}</span>
										{#if showAnswers}
											<span class="bar-text">{answer}</span>
										{/if}
									</div>
								{/each}
								{#if slide.Order.axis_labels.to}
									<div class="axis-label">{slide.Order.axis_labels.to}</div>
								{/if}
							</div>
						{:else}
							{@const correctSet = showAnswers
								? new Set(
										slide.MultipleChoice.answers.flatMap((a, i) => (a.correct ? [i] : []))
									)
								: undefined}
							<div class="slide-answers" class:revealed={showAnswers}>
								{#each slide.MultipleChoice.answers as answer, answerIndex (answerIndex)}
									{@const color = buttonColors.at(answerIndex % buttonColors.length)}
									<div
										class="bar"
										style:background-color={color?.[0]}
										style:border-color={color?.[1]}
									>
										{#if correctSet?.has(answerIndex)}
											<span class="bar-check"
												><Check height="0.9em" width="0.9em" title={m.correct()} /></span
											>
										{/if}
										{#if showAnswers}
											<span class="bar-text">{answer.content.Text}</span>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</TypicalPage>

<style>
	.image-container {
		flex: 1;
		overflow: hidden;
		display: flex;
		min-height: 6em;
		border-bottom: 1px solid color-mix(in srgb, var(--on-surface) 20%, transparent);
	}

	img {
		width: 100%;
		height: auto;
		flex: 1;
		object-fit: cover;
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
		background: var(--surface);
		border: 1px solid color-mix(in srgb, var(--on-surface) 20%, transparent);
		border-radius: 0.7em;
		overflow: hidden;
		min-width: fit-content;
		height: fit-content;
	}

	.info {
		padding: 0.5em;
	}

	.slides-pane {
		flex: 3;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		min-width: 22ch;
		height: fit-content;
	}

	.slides-toolbar {
		display: flex;
		justify-content: flex-end;
	}

	.reveal-toggle {
		font: inherit;
		font-family: var(--alternative-font);
		font-weight: 600;
		background: var(--surface);
		color: inherit;
		border: 1px solid color-mix(in srgb, var(--on-surface) 20%, transparent);
		border-radius: 0.5em;
		padding: 0.3em 0.7em;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		transition:
			border-color 120ms ease-out,
			background 120ms ease-out;
	}

	.reveal-toggle:where(:hover, :focus-visible) {
		border-color: var(--primary);
		outline: none;
	}

	.slides-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(22ch, 100%), 1fr));
		gap: 0.5em;
	}

	.slide-card {
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid color-mix(in srgb, var(--on-surface) 20%, transparent);
		border-radius: 0.7em;
		overflow: hidden;
		min-height: 16em;
	}

	.slide-title {
		font-size: 0.7em;
		flex-shrink: 0;
	}

	.slide-media {
		flex: 1;
		min-height: 0;
		margin: 0.4em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.media-img {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		border-radius: 0.4em;
	}

	.slide-answers,
	.slide-order {
		flex-shrink: 0;
		display: grid;
		gap: 0.3em;
		padding: 0.4em;
		font-size: 0.85em;
	}

	.slide-answers {
		grid-template-columns: 1fr 1fr;
	}

	.slide-answers.revealed,
	.slide-order {
		grid-template-columns: 1fr;
	}

	.bar {
		min-height: 1.2em;
		padding: 0.15em 0.4em;
		border-radius: 0.4em;
		border: 1px solid;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3em;
	}

	.bar-check {
		display: inline-flex;
		flex-shrink: 0;
	}

	.bar-num {
		font-weight: 700;
		flex-shrink: 0;
		font-family: var(--alternative-font);
	}

	.axis-label {
		text-align: center;
		font-size: 0.85em;
		opacity: 0.6;
		font-style: italic;
	}

	.bar-text {
		flex: 1;
		min-width: 0;
		text-align: center;
		word-break: break-word;
		line-height: 1.2;
	}

	.slide-typeanswer {
		flex-shrink: 0;
		margin: 0.4em;
		padding: 0.4em 0.6em;
		border: 1px dashed color-mix(in srgb, var(--on-surface) 30%, transparent);
		border-radius: 0.5em;
		min-height: 1.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85em;
	}

	.typeanswer-text {
		opacity: 0.85;
		text-align: center;
		word-break: break-word;
	}

	#page {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5em;
		max-width: 90ch;
		margin: 0 auto;
		padding: 1em 0.6em 2em;
		box-sizing: border-box;
	}
</style>
