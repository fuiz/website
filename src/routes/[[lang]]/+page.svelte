<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import logo from '$lib/assets/same_color_logo.svg';
	import Footer from '$lib/layout/Footer.svelte';
	import MainHeader from '$lib/layout/MainHeader.svelte';
	import Anchor from '$lib/navigation/Anchor.svelte';
	import AnchorMessage from '$lib/navigation/AnchorMessage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import CodeBlocksOutline from '~icons/material-symbols/code-blocks-outline';
	import Diversity1 from '~icons/material-symbols/diversity-1';
	import Diversity2Outline from '~icons/material-symbols/diversity-2-outline';
	import ErrorOutline from '~icons/material-symbols/error-outline';
	import HelpOutline from '~icons/material-symbols/help-outline';
	import Language from '~icons/material-symbols/language';
	import MailOutline from '~icons/material-symbols/mail-outline';
	import MoneyOff from '~icons/material-symbols/money-off';
	import QuestionAnswers from './host/QuestionAnswers.svelte';
	import QuestionStatistics from './host/QuestionStatistics.svelte';

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
	<link rel="canonical" href={PUBLIC_PLAY_URL + localizeHref('/')} />
</svelte:head>

<main>
	<MainHeader showLibrary={data.showLibrary} />
	<section>
		<div>
			<h2>{m.greeting()}<br />{m.create_with()}</h2>
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
							timeLeft={undefined}
							timeStarted={undefined}
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
	<section>
		<div>
			<AnchorMessage background="#23456740" message={m.fuiz_is_ongoing()} href="#ongoing">
				{#snippet icon()}<ErrorOutline height="1em" title={m.warning()} />{/snippet}
			</AnchorMessage>
		</div>
	</section>
	<section>
		<div class="split">
			<div>
				<h2>{m.about_fuiz()}</h2>
				<p>
					{m.about_fuiz_desc()}
				</p>
			</div>
			<HelpOutline height="7em" width="7em" title={m.about_fuiz()} />
		</div>
	</section>
	<section>
		<div class="split">
			<div>
				<h2>{m.free_of_charge()}</h2>
				<p>
					{m.free_of_charge_desc()}
				</p>
				<p>
					{m.number_of_participants()}
				</p>
			</div>
			<MoneyOff height="7em" width="7em" title={m.free_of_charge()} />
		</div>
	</section>
	<section>
		<div class="split">
			<div>
				<h2>{m.well_translated()}</h2>
				<p>
					{m.well_translated_desc()}
				</p>
			</div>
			<Language height="7em" width="7em" title={m.language()} />
		</div>
	</section>
	<section>
		<div class="split">
			<div>
				<h2>{m.collab_over_comp()}</h2>
				<p>
					{m.collab_over_comp_desc()}
				</p>
			</div>
			<Diversity2Outline height="7em" width="7em" title={m.collab_over_comp()} />
		</div>
	</section>
	<section>
		<div class="split">
			<div>
				<h2>{m.community_made()}</h2>
				<p>
					{m.community_made_desc()}
				</p>
			</div>
			<Diversity1 height="7em" width="7em" title={m.community_made()} />
		</div>
	</section>
	<section>
		<div class="split">
			<div>
				<h2>
					<Anchor href="https://gitlab.com/fuiz">{m.always_open()}</Anchor>
				</h2>
				<p>
					{m.always_open_desc()}
				</p>
			</div>
			<CodeBlocksOutline height="7em" width="7em" title={m.always_open()} />
		</div>
	</section>
	<section id="ongoing">
		<div class="split">
			<div>
				<h2>{m.stay_in_touch()}</h2>
				<p>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html m.stay_in_touch_desc()}
				</p>
			</div>
			<MailOutline height="7em" width="7em" title={m.stay_in_touch()} />
		</div>
	</section>
	<footer>
		<Footer />
	</footer>
</main>

<style>
	main {
		background-color: var(--background-color);
		line-height: 1.25;
	}

	section {
		& > div {
			max-width: 45ch;
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
