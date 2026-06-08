<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import logo from '$lib/assets/same_color_logo_padded.svg';
	import Footer from '$lib/layout/Footer.svelte';
	import MainHeader from '$lib/layout/MainHeader.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import QuestionAnswers from '$lib/question-types/mcq/host/Answers.svelte';
	import QuestionStatistics from '$lib/question-types/mcq/host/Statistics.svelte';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import CodeBlocksOutline from '~icons/material-symbols/code-blocks-outline';
	import Diversity1 from '~icons/material-symbols/diversity-1';
	import Diversity2Outline from '~icons/material-symbols/diversity-2-outline';
	import Forum from '~icons/material-symbols/forum-outline';
	import Language from '~icons/material-symbols/language';
	import MoneyOff from '~icons/material-symbols/money-off';
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
				<div class="slide">
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
				</div>
			</div>
		</div>
	</section>
	{#if !data.selfHosted}
		<section>
			<div class="features">
				<div class="feature-card">
					<div class="feature-icon">
						<MoneyOff height="2em" width="2em" title={m.free_of_charge()} />
					</div>
					<h3>{m.free_of_charge()}</h3>
					<p>{m.free_of_charge_desc()}</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">
						<Language height="2em" width="2em" title={m.language()} />
					</div>
					<h3>{m.well_translated()}</h3>
					<p>{m.well_translated_desc()}</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">
						<Diversity2Outline height="2em" width="2em" title={m.collab_over_comp()} />
					</div>
					<h3>{m.collab_over_comp()}</h3>
					<p>{m.collab_over_comp_desc()}</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">
						<Diversity1 height="2em" width="2em" title={m.community_made()} />
					</div>
					<h3>{m.community_made()}</h3>
					<p>{m.community_made_desc()}</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">
						<CodeBlocksOutline height="2em" width="2em" title={m.always_open()} />
					</div>
					<h3>{m.always_open()}</h3>
					<p>{m.always_open_desc()}</p>
				</div>
			</div>
		</section>
		<section>
			<div class="cta">
				<Forum height="2em" width="2em" title={m.join_community()} />
				<h2>{m.join_community()}</h2>
				<p>{m.join_community_subtitle()}</p>
				<div class="cta-buttons">
					<div class="cta-button">
						<FancyAnchorButton
							href="https://join.slack.com/t/fuiz/shared_invite/zt-2enihgtpy-C1KxJ96pEQN707msi~vNRg"
							palette="slack"
						>
							{m.join_slack()}
						</FancyAnchorButton>
					</div>
				</div>
			</div>
		</section>
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

	h2 {
		margin: 0 0 0.5em;
		font-family: var(--alternative-font);
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
		border: 1px solid var(--outline);
		border-radius: 1rem 1rem 1.25rem 1.25rem;
		position: relative;
		overflow: hidden;
		/* Container query below resolves `ch` against this font, so match the
		   answer area's font (1.5em of the slide font) — that way our threshold
		   lines up with the answers' own 2×2 → 1×4 flip. */
		container-type: inline-size;
		font-size: calc(1.5 * min(1rem, 3vw));
	}

	.slide {
		position: relative;
		font-size: min(1rem, 3vw);
		aspect-ratio: 90 / 72;
		z-index: 1;
	}

	/* Same threshold the answers use to stack into one column
	   (game/Answers.svelte: @container (width <= 40ch)). When that happens the
	   host screen is taller, so switch to a taller, portrait box at the same point. */
	@container (width <= 40ch) {
		.slide {
			aspect-ratio: 4 / 5;
		}
	}

	.features {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1em;
		max-width: 70ch;
		margin: auto;
	}

	.feature-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.5em;
		padding: 1.5em 1.2em;
		border-radius: 1em;
		background: var(--surface);
		border: 1px solid color-mix(in srgb, var(--on-surface) 12%, transparent);
		flex: 1 1 12em;
		max-width: 20em;
		transition: border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.feature-card:hover {
		border-color: color-mix(in srgb, var(--card-color) 40%, transparent);
	}

	.feature-card:nth-child(1) {
		--card-color: hsl(358, 84%, 45%);
	}
	.feature-card:nth-child(2) {
		--card-color: hsl(205, 84%, 30%);
	}
	.feature-card:nth-child(3) {
		--card-color: hsl(120, 83%, 25%);
	}
	.feature-card:nth-child(4) {
		--card-color: hsl(25, 84%, 48%);
	}
	.feature-card:nth-child(5) {
		--card-color: hsl(318, 84%, 35%);
	}

	.feature-icon {
		font-size: 1.5em;
		line-height: 0;
	}

	.feature-card h3 {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: 1.15em;
		font-weight: 700;
	}

	.feature-card p {
		margin: 0.2em 0;
		opacity: 0.8;
		font-size: 0.95em;
	}

	.cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3em;
		padding: 4em 1.5em;
	}

	.cta p {
		opacity: 0.8;
		margin: 0 0 0.5em;
	}

	.cta-buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.8em;
	}

	.cta-button {
		width: 12em;
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
