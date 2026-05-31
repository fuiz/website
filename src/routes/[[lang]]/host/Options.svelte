<script lang="ts">
	import { playIdlessConfig } from '$lib/clientOnly';
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { type CreationId, getCreation, loadDatabase } from '$lib/storage';
	import type { GenericIdlessFuizConfig, GenericIdlessSlide, NameStyle } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Stepper from '$lib/ui/Stepper.svelte';
	import Switch from '$lib/ui/Switch.svelte';
	import CasinoOutline from '~icons/material-symbols/casino-outline';
	import Gavel from '~icons/material-symbols/gavel';
	import GroupsOutline from '~icons/material-symbols/groups-outline';
	import LeaderboardOutline from '~icons/material-symbols/leaderboard-outline';
	import PersonAddOutline from '~icons/material-symbols/person-add-outline';
	import PhoneAndroidOutline from '~icons/material-symbols/phone-android-outline';
	import ShortText from '~icons/material-symbols/short-text';
	import Shuffle from '~icons/material-symbols/shuffle';
	import SwapVert from '~icons/material-symbols/swap-vert';
	import TheaterComedyOutline from '~icons/material-symbols/theater-comedy-outline';

	let { id }: { id: CreationId } = $props();

	let loading = $state(false);

	let errorMessage = $state('');

	let nameStyle = $state<NameStyle | null>(null),
		questionsOnPlayersDevices = $state(false),
		shuffleAnswers = $state(true),
		shuffleSlides = $state(false),
		leaderboard = $state(true),
		teams = $state(false),
		teamSize = $state(4),
		assignRandom = $state(false),
		censorNames = $state(true);

	type StyleKey = 'Pet' | 'Roman';
	const styleKinds: StyleKey[] = ['Pet', 'Roman'];

	function styleLabel(k: StyleKey): string {
		return k === 'Pet' ? m.petnames() : m.romannames();
	}

	function exampleFor(k: StyleKey, len: 2 | 3): string {
		if (k === 'Pet') return len === 2 ? 'Swift Fox' : 'Quietly Swift Fox';
		return len === 2 ? 'Marcus Aurelius' : 'Marcus Aurelius Cato';
	}

	// https://stackoverflow.com/a/2450976
	function shuffleArray<T>(array: T[]): T[] {
		let currentIndex = array.length;

		// While there remain elements to shuffle.
		while (currentIndex > 0) {
			// Pick a remaining element.
			const randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	function conditionalShuffleAnswer<T>(
		slide: GenericIdlessSlide<T>,
		shuffleAnswers: boolean
	): GenericIdlessSlide<T> {
		return {
			...slide,
			...('MultipleChoice' in slide && {
				MultipleChoice: {
					...slide.MultipleChoice,
					answers: shuffleAnswers
						? shuffleArray(slide.MultipleChoice.answers)
						: slide.MultipleChoice.answers
				}
			})
		};
	}

	function shuffle<T>(
		config: GenericIdlessFuizConfig<T>,
		shuffleSlides: boolean,
		shuffleAnswers: boolean
	): GenericIdlessFuizConfig<T> {
		return {
			...config,
			slides: (shuffleSlides ? shuffleArray(config.slides) : config.slides).map((slide) =>
				conditionalShuffleAnswer(slide, shuffleAnswers)
			)
		};
	}
</script>

{#await loadDatabase().then((db) => getCreation(id, db))}
	<Loading />
{:then fuiz}
	{#if !fuiz}
		<ErrorPage errorMessage={m.missing_fuiz()} />
	{:else}
		{@const { config } = fuiz}
		<TypicalPage>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					errorMessage = '';
					loading = true;
					playIdlessConfig(shuffle(config, shuffleSlides, shuffleAnswers), {
						random_names: nameStyle,
						show_answers: questionsOnPlayersDevices || teams,
						no_leaderboard: !leaderboard,
						profanity: censorNames ? 'Censor' : 'Allow',
						...(teams && { teams: { size: teamSize, assign_random: assignRandom } })
					}).then((err) => {
						loading = false;
						if (err) {
							errorMessage = err;
						}
					});
				}}
			>
				<h2>{m.options()}</h2>

				<div class="section">
					<div class="section-label">{m.section_players()}</div>
					<div class="card">
						<Switch
							id="random"
							checked={false}
							onchange={(checked) => {
								if (checked) {
									nameStyle = { Petname: 2 };
								} else {
									nameStyle = null;
								}
							}}
						>
							<TheaterComedyOutline height="1.2em" width="1.2em" />
							{m.randomized_names()}
						</Switch>
						{#if nameStyle !== null}
							{@const len = 'Roman' in nameStyle ? nameStyle.Roman : nameStyle.Petname}
							{@const currentKind: StyleKey = 'Roman' in nameStyle ? 'Roman' : 'Pet'}
							<div class="style-grid">
								{#each styleKinds as k (k)}
									<button
										type="button"
										class="style-card"
										class:selected={currentKind === k}
										onclick={() =>
											(nameStyle = k === 'Roman' ? { Roman: len } : { Petname: len })}
									>
										<div class="style-title">{styleLabel(k)}</div>
										<div class="style-hint">{exampleFor(k, len)}</div>
									</button>
								{/each}
							</div>
							<Stepper
								value={len}
								onchange={(v) => {
									if (nameStyle !== null && (v === 2 || v === 3))
										nameStyle = 'Roman' in nameStyle ? { Roman: v } : { Petname: v };
								}}
								min={2}
								max={3}
							>
								<ShortText height="1.2em" width="1.2em" />
								{m.random_name_length()}
							</Stepper>
						{/if}
						<Switch id="censor" bind:checked={censorNames}>
							<Gavel height="1.2em" width="1.2em" />
							{m.censor_names()}
						</Switch>
					</div>
				</div>

				<div class="section">
					<div class="section-label">{m.section_teams()}</div>
					<div class="card">
						<Switch id="teams" bind:checked={teams}>
							<GroupsOutline height="1.2em" width="1.2em" />
							{m.teams()}
						</Switch>
						{#if teams}
							<Stepper bind:value={teamSize} min={2} max={5}>
								<PersonAddOutline height="1.2em" width="1.2em" />
								{m.optimal_team_size()}
							</Stepper>
							<Switch id="assign_random" bind:checked={assignRandom}>
								<CasinoOutline height="1.2em" width="1.2em" />
								{m.assign_random()}
							</Switch>
						{/if}
					</div>
				</div>

				<div class="section">
					<div class="section-label">{m.section_display()}</div>
					<div class="card">
						<Switch
							id="players"
							bind:checked={questionsOnPlayersDevices}
							stuck={teams ? true : undefined}
						>
							<PhoneAndroidOutline height="1.2em" width="1.2em" />
							{m.questions_on_players_devices()}
						</Switch>
						<Switch id="leaderboard" bind:checked={leaderboard}>
							<LeaderboardOutline height="1.2em" width="1.2em" />
							{m.leaderboard()}
						</Switch>
					</div>
				</div>

				<div class="section">
					<div class="section-label">{m.section_randomization()}</div>
					<div class="card">
						<Switch id="shuffle_slides" bind:checked={shuffleSlides}>
							<Shuffle height="1.2em" width="1.2em" />
							{m.shuffle_slides()}
						</Switch>
						<Switch id="shuffle_answers" bind:checked={shuffleAnswers}>
							<SwapVert height="1.2em" width="1.2em" />
							{m.shuffle_answers()}
						</Switch>
					</div>
				</div>

				<ErrorMessage {errorMessage} />
				<div class="start-row">
					<FancyButton disabled={loading}>
						<div id="button">
							{#if loading}
								<div style:height="1em" style:width="1em">
									<LoadingCircle borderWidth={3} />
								</div>
							{/if}
							{m.start()}
						</div>
					</FancyButton>
				</div>
			</form>
		</TypicalPage>
	{/if}
{/await}

<style>
	form {
		display: flex;
		flex-direction: column;
		max-width: min(36ch, 90vw);
		gap: 1em;
		padding: 0.5em;
		box-sizing: border-box;
		margin: 0 auto;
	}

	h2 {
		margin: 0;
		text-align: center;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	.section-label {
		padding: 0 0.3em;
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
		font-family: var(--alternative-font);
		font-weight: 800;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		border: 1px solid var(--outline);
		border-radius: 0.7em;
		background: var(--surface);
		padding: 0.6em 0.7em;
	}

	.start-row {
		display: flex;
		justify-content: center;
	}

	#button {
		padding: 0.1em 0.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		font-family: var(--alternative-font);
	}

	.style-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5em;
	}

	.style-card {
		appearance: none;
		font: inherit;
		color: inherit;
		text-align: start;
		cursor: pointer;
		padding: 0.6em 0.7em;
		border: 1px solid var(--outline);
		border-radius: 0.6em;
		background: var(--surface);
		transition: border-color 150ms, background 150ms;
	}

	.style-card.selected {
		border-color: var(--primary);
		background: color-mix(in srgb, var(--primary) 8%, var(--surface));
	}

	.style-title {
		font-family: var(--alternative-font);
		font-weight: 800;
		font-size: 1em;
	}

	.style-hint {
		font-size: 0.75em;
		opacity: 0.5;
		font-style: italic;
		margin-top: 0.15em;
	}
</style>
