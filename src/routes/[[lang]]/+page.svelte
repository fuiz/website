<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import logo from '$lib/assets/same_color_logo_padded.svg';
	import Footer from '$lib/layout/Footer.svelte';
	import MainHeader from '$lib/layout/MainHeader.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import QuestionAnswers from '$lib/question-types/mcq/host/QuestionAnswers.svelte';
	import QuestionStatistics from '$lib/question-types/mcq/host/QuestionStatistics.svelte';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import CodeBlocksOutline from '~icons/material-symbols/code-blocks-outline';
	import Diversity1 from '~icons/material-symbols/diversity-1';
	import Diversity2Outline from '~icons/material-symbols/diversity-2-outline';
	import Language from '~icons/material-symbols/language';
	import MailOutline from '~icons/material-symbols/mail-outline';
	import MoneyOff from '~icons/material-symbols/money-off';

	let { data = $bindable() } = $props();

	const title = m.main_title();
	const description = m.main_desc();

	const fields = ['open', 'design', 'lightweight', 'privacy'] as const;

	let answered = $state<(typeof fields)[number] | undefined>(undefined);

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
			<h2>{m.greeting()}<br />{m.create_with()}</h2>
			<p class="subtitle">{m.about_fuiz_desc()}</p>
			<div class="slide-container">
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
	{#if (data.gamesPlayed ?? undefined !== undefined) && (data.playersJoined ?? undefined !== undefined)}
		<section>
			<div class="split">
				<div class="stat">
					<FancyButton active={false}>
						<span class="header">
							{data.gamesPlayed}
						</span>
						<span class="subheader">{m.total_games()}</span>
					</FancyButton>
				</div>
				<div class="stat">
					<FancyButton active={false}>
						<span class="header">
							{data.playersJoined}
						</span>
						<span class="subheader">{m.total_players()}</span>
					</FancyButton>
				</div>
			</div>
		</section>
	{/if}
	{#if !data.selfHosted}
		<section>
			<div class="features">
				<div class="feature-card">
					<MoneyOff height="3em" width="3em" title={m.free_of_charge()} />
					<h3>{m.free_of_charge()}</h3>
					<p>{m.free_of_charge_desc()}</p>
				</div>
				<div class="feature-card">
					<Language height="3em" width="3em" title={m.language()} />
					<h3>{m.well_translated()}</h3>
					<p>{m.well_translated_desc()}</p>
				</div>
				<div class="feature-card">
					<Diversity2Outline height="3em" width="3em" title={m.collab_over_comp()} />
					<h3>{m.collab_over_comp()}</h3>
					<p>{m.collab_over_comp_desc()}</p>
				</div>
				<div class="feature-card">
					<Diversity1 height="3em" width="3em" title={m.community_made()} />
					<h3>{m.community_made()}</h3>
					<p>{m.community_made_desc()}</p>
				</div>
				<div class="feature-card">
					<CodeBlocksOutline height="3em" width="3em" title={m.always_open()} />
					<h3>{m.always_open()}</h3>
					<p>{m.always_open_desc()}</p>
				</div>
			</div>
		</section>
		<section>
			<div class="cta">
				<MailOutline height="2em" width="2em" title={m.stay_in_touch()} />
				<h2>{m.stay_in_touch()}</h2>
				<p>{m.stay_in_touch_subtitle()}</p>
				<div class="cta-buttons">
					<div class="cta-button">
						<FancyAnchorButton
							href="https://forms.gle/orFqr1wnhm6dv7xY7"
							backgroundColor="var(--secondary)"
							backgroundDeepColor="color-mix(in srgb, var(--secondary) 80%, black)"
							foregroundColor="var(--on-secondary)"
						>
							{m.feedback_form()}
						</FancyAnchorButton>
					</div>
					<div class="cta-button">
						<FancyAnchorButton
							href="https://join.slack.com/t/fuiz/shared_invite/zt-2enihgtpy-C1KxJ96pEQN707msi~vNRg"
							backgroundColor="var(--tertiary)"
							backgroundDeepColor="color-mix(in srgb, var(--tertiary) 80%, black)"
							foregroundColor="var(--on-tertiary)"
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

	h2 {
		margin: 0 0 0.5em;
		font-family: var(--alternative-font);
	}

	p {
		margin: 0.5em 0;
	}

	.subtitle {
		opacity: 0.8;
		max-width: 45ch;
		margin: 0.5em auto 1em;
	}

	.slide-container {
		border: 0.15em solid;
		border-radius: 0.9em;
		position: relative;
		overflow: hidden;
	}

	.slide {
		position: relative;
		font-size: min(1em, 3vw);
		aspect-ratio: 90 / 72;
		z-index: 1;
	}

	.split {
		& div:first-child {
			flex: 1;
		}
		flex-wrap: wrap-reverse;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1em;
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
		gap: 0.4em;
		padding: 1.2em 1em;
		border-radius: 0.8em;
		background: color-mix(in srgb, currentColor 5%, transparent);
		flex: 1 1 12em;
		max-width: 20em;
	}

	.feature-card h3 {
		margin: 0;
		font-family: var(--alternative-font);
	}

	.feature-card p {
		margin: 0.2em 0;
	}

	.cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3em;
		background: color-mix(in srgb, currentColor 5%, transparent);
		border-radius: 0.8em;
		padding: 2em 1.5em;
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

	.stat {
		flex: 1;

		& .header {
			display: block;
			font-size: 2em;
			font-weight: bold;
			font-family: var(--alternative-font);
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
