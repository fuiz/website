<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import logo from '$lib/assets/same_color_logo_padded.svg';
	import CommunityLibrary from '$lib/landing/CommunityLibrary.svelte';
	import FreeZero from '$lib/landing/FreeZero.svelte';
	import JoinConversation from '$lib/landing/JoinConversation.svelte';
	import OpenSourceCommand from '$lib/landing/OpenSourceCommand.svelte';
	import PlayersGrid from '$lib/landing/PlayersGrid.svelte';
	import TeamworkDivide from '$lib/landing/TeamworkDivide.svelte';
	import TranslationWords from '$lib/landing/TranslationWords.svelte';
	import Footer from '$lib/layout/Footer.svelte';
	import MainHeader from '$lib/layout/MainHeader.svelte';
	import { limits } from '$lib/limits';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import QuestionAnswers from '$lib/question-types/mcq/host/Answers.svelte';
	import QuestionStatistics from '$lib/question-types/mcq/host/Statistics.svelte';
	import Card from '$lib/ui/Card.svelte';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import Palette from '~icons/material-symbols/palette';

	let { data = $bindable() } = $props();

	const title = m.main_title();
	const description = m.main_desc();

	const fields = ['open', 'design', 'lightweight', 'privacy'] as const;

	let answered = $state<(typeof fields)[number]>();

	onMount(() => {
		let answeredStored = localStorage.getItem('answered');
		for (const field of fields) {
			if (answeredStored === field) {
				answered = field;
				return;
			}
		}
		answered = undefined;
	});

	/**
	 * Handle when a user chooses their favorite feature.
	 * @param {number} e
	 */
	async function onChooseFavoriteFeature(e: number) {
		const field = fields[e];

		localStorage.setItem('answered', field);

		answered = field;
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<link rel="canonical" href={env.PUBLIC_PLAY_URL + localizeHref('/')} />
</svelte:head>

<main>
	<MainHeader showLibrary={data.showLibrary} selfHosted={data.selfHosted} />
	<section>
		<div>
			<h1 class="hero-title hero-enter" style:--hero-delay="0ms">{m.greeting()}<br />{m.create_with()}</h1>
			<p class="subtitle hero-enter" style:--hero-delay="120ms">{m.about_fuiz_desc()}</p>
			{#if data.gamesPlayed !== undefined && data.playersJoined !== undefined}
				<div class="hero-stats hero-enter" style:--hero-delay="240ms">
					<div class="hero-stat">
						<span class="hero-stat-number">{data.gamesPlayed}</span>
						<span class="hero-stat-label">{m.total_games()}</span>
					</div>
					<div class="hero-stat-divider" aria-hidden="true"></div>
					<div class="hero-stat">
						<span class="hero-stat-number">{data.playersJoined}</span>
						<span class="hero-stat-label">{m.total_players()}</span>
					</div>
				</div>
			{/if}
			<div class="hero-cta hero-enter" style:--hero-delay="360ms">
				<FancyAnchorButton href={resolve(localizeHref('/create'))}>
					<div class="hero-cta-inner">
						<Palette height="1.2em" title={m.create()} />
						<div>{m.create()}</div>
					</div>
				</FancyAnchorButton>
			</div>
			<div class="slide-container hero-enter" style:--hero-delay="480ms">
				<Card padding="0" class="slide">
					{#if answered !== undefined}
						<QuestionStatistics
							questionText={m.which_feature()}
							answers={[
								{
									text: m.open_source(),
									count: Number(answered === 'open'),
									correct: true
								},
								{
									text: m.beautiful_design(),
									count: Number(answered === 'design'),
									correct: true
								},
								{
									text: m.lightweight(),
									count: Number(answered === 'lightweight'),
									correct: true
								},
								{
									text: m.privacy_friendly(),
									count: Number(answered === 'privacy'),
									correct: true
								}
							]}
							bindableGameInfo={{
								volumeOn: false,
								locked: false
							}}
							gameInfo={{
								gameCode: 'Survey',
								questionIndex: 0,
								questionTotalCount: 1
							}}
						/>
					{:else}
						<QuestionAnswers
							onanswer={onChooseFavoriteFeature}
							questionText={m.which_feature()}
							timeLeft={null}
							timeStarted={null}
							answers={[
								m.open_source(),
								m.beautiful_design(),
								m.lightweight(),
								m.privacy_friendly()
							]}
							answeredCount={0}
							bindableGameInfo={{
								volumeOn: false,
								locked: false
							}}
							gameInfo={{
								gameCode: 'Survey',
								questionIndex: 0,
								questionTotalCount: 1
							}}
							media={{
								Image: {
									Url: {
										url: logo,
										alt: m.logo_alt()
									}
								}
							}}
						/>
					{/if}
				</Card>
			</div>
		</div>
	</section>
	{#if !data.selfHosted}
		<!-- Side-by-side sections, alternating which side the words are on, take
		     turns with centred ones, and the last leads into joining the
		     community. -->
		<PlayersGrid count={limits.fuiz.maxPlayerCount} />
		<TeamworkDivide />
		<FreeZero />
		<TranslationWords />
		<OpenSourceCommand />
		<CommunityLibrary showLibrary={data.showLibrary} />
		<JoinConversation />
	{/if}
	<footer>
		<Footer />
	</footer>
</main>

<style>
	main {
		background-color: var(--surface);
		background-image: radial-gradient(
			ellipse 120% 40em at center 24em,
			color-mix(in srgb, var(--primary) 18%, var(--surface)) 0%,
			var(--surface) 80%
		);
		background-repeat: no-repeat;
		line-height: 1.25;
	}

	section {
		& > div {
			max-width: 70ch;
			margin: auto;
		}

		text-align: center;

		padding: 1em;
	}

	.hero-enter {
		animation: hero-fade-up 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
		animation-delay: var(--hero-delay, 0ms);
	}

	@keyframes hero-fade-up {
		from {
			opacity: 0;
			transform: translateY(0.75em);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-enter {
			animation: none;
		}
	}

	p {
		margin: 0.5em 0;
	}

	.hero-title {
		font-family: var(--alternative-font);
		font-size: clamp(2.25em, 5.5vw, 3.5em);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
		margin: 0 0 0.4em;
	}

	.subtitle {
		opacity: 0.8;
		max-width: 45ch;
		margin: 0.5em auto 1em;
		font-size: 1.1em;
	}

	.hero-stats {
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 1.5em;
		margin: 1em 0 1.25em;
		flex-wrap: wrap;
	}

	.hero-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1em;
	}

	.hero-stat-number {
		font-size: 1.75em;
		font-weight: 800;
		font-family: var(--alternative-font);
		line-height: 1;
	}

	.hero-stat-label {
		font-size: 0.85em;
		opacity: 0.7;
	}

	.hero-stat-divider {
		width: 1px;
		background: color-mix(in srgb, var(--on-surface) 20%, transparent);
	}

	.hero-cta {
		display: flex;
		justify-content: center;
		margin: 0 auto 1.5em;
		width: fit-content;
		font-size: 1.25em;
	}

	.hero-cta-inner {
		display: flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.5em 1.5em;
		font-family: var(--alternative-font);
	}

	.slide-container {
		--card-radius: 1rem 1rem 1.25rem 1.25rem;
		position: relative;
		/* Container query below resolves `ch` against this font, so match the
		   answer area's font (1.5em of the slide font) so that our threshold
		   lines up with the answers' own 2x2 to 1x4 flip. */
		container-type: inline-size;
		font-size: calc(1.5 * min(1rem, 3vw));
	}

	.slide-container :global(.slide) {
		display: block;
		position: relative;
		font-size: min(1rem, 3vw);
		aspect-ratio: 90 / 72;
		z-index: 1;
	}

	/* Same threshold the answers use to stack into one column
	   (game/Answers.svelte: @container (width <= 40ch)). When that happens the
	   host screen is taller, so switch to a taller, portrait box at the same point. */
	@container (width <= 40ch) {
		.slide-container :global(.slide) {
			aspect-ratio: 4 / 5;
		}
	}

	:global(a.styled) {
		text-decoration: none;
		--highlight: color-mix(in srgb, currentColor 20%, transparent);
		background: var(--highlight);
		color: inherit;
		padding: 0.05em 0.15em;
		border-radius: 0.15em;
		font-weight: bold;

		display: inline-flex;
		align-items: center;

		&:focus,
		&:hover {
			outline: 0.15em solid var(--highlight);
			text-decoration: underline solid;
		}
	}
</style>
