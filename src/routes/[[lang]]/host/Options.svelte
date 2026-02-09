<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { playIdlessConfig } from '$lib/clientOnly';
	import ErrorMessage from '$lib/feedback/ErrorMessage.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import Switch from '$lib/ui/Switch.svelte';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import Slider from '$lib/ui/Slider.svelte';
	import { getCreation, loadDatabase, type CreationId } from '$lib/storage';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import LoadingCircle from '$lib/feedback/LoadingCircle.svelte';
	import Radio from '$lib/ui/Radio.svelte';
	import type { GenericIdlessFuizConfig, GenericIdlessSlide, NameStyle } from '$lib/types';

	let { id }: { id: CreationId } = $props();

	let loading = $state(false);

	let errorMessage = $state('');

	let nameStyle = $state<NameStyle | null>(null),
		questionsOnPlayersDevices = $state(false),
		shuffleAnswers = $state(false),
		shuffleSlides = $state(false),
		leaderboard = $state(true),
		teams = $state(false),
		teamSize = $state(4),
		assignRandom = $state(false);

	const randomNameOptions = [
		{ value: 'Pet', label: m.petnames() },
		{ value: 'Roman', label: m.romannames() }
	];

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
				<div id="options">
					<div class="switch">
						<Switch id="teams" bind:checked={teams}>{m.teams()}</Switch>
					</div>
					{#if teams}
						<hr />
						<Slider id="team_size" bind:value={teamSize} min={2} max={5}
							>{m.optimal_team_size()}</Slider
						>
						<hr />
						<div class="switch">
							<Switch id="assign_random" bind:checked={assignRandom}>
								{m.assign_random()}
							</Switch>
						</div>
					{/if}
					<hr />
					<div class="switch">
						<Switch
							id="players"
							bind:checked={questionsOnPlayersDevices}
							stuck={teams ? true : undefined}
						>
							{m.questions_on_players_devices()}
						</Switch>
					</div>
					<hr />
					<div class="switch">
						<Switch
							id="random"
							checked={false}
							onchange={(checked) => {
								if (checked) {
									nameStyle = {
										Petname: 2
									};
								} else {
									nameStyle = null;
								}
							}}
						>
							{m.randomized_names()}
						</Switch>
					</div>
					{#if nameStyle !== null}
						<Radio
							options={randomNameOptions}
							label="Name Type"
							value={'Roman' in nameStyle ? 'Roman' : 'Pet'}
							onchange={(value) => {
								if (nameStyle !== null) {
									const currentValue = 'Roman' in nameStyle ? nameStyle.Roman : nameStyle.Petname;
									nameStyle =
										value === 'Roman' ? { Roman: currentValue } : { Petname: currentValue };
								}
							}}
						/>
						<Slider
							id="team_size"
							value={'Roman' in nameStyle ? nameStyle.Roman : nameStyle.Petname}
							onchange={(value) => {
								if (nameStyle !== null && (value == 2 || value == 3)) {
									nameStyle = 'Roman' in nameStyle ? { Roman: value } : { Petname: value };
								}
							}}
							min={2}
							max={3}
						>
							{m.random_name_length()}
						</Slider>
					{/if}
					<hr />
					<div class="switch">
						<Switch id="shuffle_slides" bind:checked={shuffleSlides}>{m.shuffle_slides()}</Switch>
					</div>
					<hr />
					<div class="switch">
						<Switch id="shuffle_answers" bind:checked={shuffleAnswers}>{m.shuffle_answers()}</Switch
						>
					</div>
					<hr />
					<div class="switch">
						<Switch id="leaderboard" bind:checked={leaderboard}>{m.leaderboard()}</Switch>
					</div>
				</div>
				<ErrorMessage {errorMessage} />
				<div>
					<FancyButton disabled={loading}>
						<div id="button">
							{#if loading}
								<div style:height="1em" style:width="1em">
									<LoadingCircle borderWidth={7} />
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
		align-items: center;
		justify-content: center;
		max-width: 25ch;
		gap: 1em;
		padding: 0.5em;
		box-sizing: border-box;
		margin: auto;
	}

	#options {
		display: flex;
		flex-direction: column;
		border: 0.1em solid;
		gap: 0.5em;
		border-radius: 1em;
		padding: 0.5em;
	}

	hr {
		width: 100%;
		color: inherit;
		margin: 0;
	}

	h2 {
		margin: 0;
	}

	#button {
		padding: 0.1em 0.5em;
		display: flex;
		align-items: center;
		gap: 0.5em;
		font-family: Poppins;
	}
</style>
