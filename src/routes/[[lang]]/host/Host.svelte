<script lang="ts">
	import { onMount, setContext, untrack } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { getFuizOrigin } from '$lib/clientOnly';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import BrainstormIdeas from '$lib/question-types/brainstorm/host/Ideas.svelte';
	import BrainstormStatistics from '$lib/question-types/brainstorm/host/Statistics.svelte';
	import BrainstormVoting from '$lib/question-types/brainstorm/host/Voting.svelte';
	import FreeTextAnswers from '$lib/question-types/free-text/host/Answers.svelte';
	import FreeTextStatistics from '$lib/question-types/free-text/host/Statistics.svelte';
	import {
		type BindableGameInfo,
		HOST_RESPONSES,
		HOST_TEAM_ROSTERS,
		type HostResponses,
		type HostTeamRosters,
		type TeamRoster
	} from '$lib/question-types/host/types';
	import InfoSlideContent from '$lib/question-types/info-slide/host/Content.svelte';
	import QuestionAnswers from '$lib/question-types/mcq/host/Answers.svelte';
	import QuestionStatistics from '$lib/question-types/mcq/host/Statistics.svelte';
	import OrderAnswers from '$lib/question-types/order/host/Answers.svelte';
	import OrderStatistics from '$lib/question-types/order/host/Statistics.svelte';
	import PinAnswers from '$lib/question-types/pin/host/Answers.svelte';
	import PinStatistics from '$lib/question-types/pin/host/Statistics.svelte';
	import PollAnswers from '$lib/question-types/poll/host/Answers.svelte';
	import PollStatistics from '$lib/question-types/poll/host/Statistics.svelte';
	import ScaleAnswers from '$lib/question-types/scale/host/Answers.svelte';
	import ScaleStatistics from '$lib/question-types/scale/host/Statistics.svelte';
	import SliderAnswers from '$lib/question-types/slider/host/Answers.svelte';
	import SliderStatistics from '$lib/question-types/slider/host/Statistics.svelte';
	import TypeAnswerStatistics from '$lib/question-types/type-answer/host/Statistics.svelte';
	import { bring, zip } from '$lib/util';
	import { hostScreenFromState, type IncomingMessage, resultsSlideIndex, type State } from '.';
	import Leaderboard from './Leaderboard.svelte';
	import {
		handleBrainstormMessage,
		handleFreeTextMessage,
		handleGameMessage,
		handleInfoSlideMessage,
		handleMultipleChoiceMessage,
		handleOrderMessage,
		handlePinMessage,
		handlePollMessage,
		handleScaleMessage,
		handleSliderMessage,
		handleTypeAnswerMessage,
		type QuestionMessageResult
	} from './messageHandler';
	import Question from './Question.svelte';
	import SlideAnnouncement from './SlideAnnouncement.svelte';
	import Summary from './Summary.svelte';
	import Waiting from './Waiting.svelte';

	let currentState = $state<State>();

	// Who answered the current slide. Dropped whenever the slide changes so it
	// can never show stale names.
	let playerResponses = $state<{ name: string; answer: string }[]>();

	// Who is on each team. Unlike the responses above this is not slide-scoped,
	// so it survives an advance; it is re-fetched rather than patched, because
	// a member dropping raises no event the host could key an update off.
	let teamRosters = $state<TeamRoster[]>();
	let teamMode = $state(false);
	let teamsFormed = $state(false);

	// Every slide's answers, kept by slide index for the end-of-game response
	// log. The live list above can't serve this: it is cleared on each advance,
	// and the server only joins names to answers while the slide is still up.
	let capturedResponses = $state<Record<number, { name: string; answer: string }[]>>({});

	// The slide we last asked about, so a reply that lands after the host has
	// advanced is filed against the right question, or dropped.
	let requestedIndex: number | undefined;

	let timer = $state<number | null>(0);
	let initialTimer = $state<number | null>(0);

	const UPDATE_DURATION = 100;

	setInterval(() => {
		if (timer !== null) {
			timer = Math.max(0, timer - UPDATE_DURATION);
		}
	}, UPDATE_DURATION);

	let { code }: { code: string } = $props();

	let bindableGameInfo = $state<BindableGameInfo>({
		volumeOn: true,
		locked: false
	});

	function applyQuestionResult(result: QuestionMessageResult) {
		if (result.newState !== undefined) {
			currentState = result.newState;
			playerResponses = undefined;
		}
		if (result.timer !== undefined) {
			timer = result.timer;
		}
		if (result.initialTimer !== undefined) {
			initialTimer = result.initialTimer;
		}
	}

	let sendEvent = $state<(data: string) => void>(() => {});
	let closeEvent = $state<() => void>(() => {});

	function connectServer(code: string) {
		let watcherId = localStorage.getItem(code + '_host') || undefined;
		let socket = new WebSocket(env.PUBLIC_WS_URL + '/watch/' + code + '/' + (watcherId ?? ''));

		currentState = undefined;
		bindableGameInfo = {
			volumeOn: bindableGameInfo.volumeOn,
			locked: false
		};
		let finished = false;

		// Listen for messages
		socket.addEventListener('message', (event) => {
			let newMessage: IncomingMessage = JSON.parse(event.data);

			if ('Game' in newMessage) {
				const result = handleGameMessage(newMessage.Game, {
					code,
					currentState,
					watcherId,
					bindableGameInfo
				});
				if (result.newState !== undefined) {
					currentState = result.newState;
				}
				if (result.newWatcherId !== undefined) {
					watcherId = result.newWatcherId;
					localStorage.setItem(code + '_host', watcherId);
				}
				if (result.newLockStatus !== undefined) {
					bindableGameInfo.locked = result.newLockStatus;
				}
				if (result.newTeamMode !== undefined) {
					teamMode = result.newTeamMode;
				}
				if (result.teamsFormed) {
					teamsFormed = true;
					// The lobby and the team display are the same `HostScreen`, so
					// advancing from one to the other leaves `currentScreen`
					// untouched and the duplicate-click guard below latched on. The
					// screen did move; let the next advance through.
					lastSentScreen = null;
				}
				if (result.newTeamRosters !== undefined) {
					teamRosters = result.newTeamRosters;
				}
				if (result.shouldMarkFinished) {
					finished = true;
				}
				if (result.shouldCloseSocket) {
					socket.close();
				}
				if (result.newPlayerResponses !== undefined) {
					playerResponses = result.newPlayerResponses;
					// Only file it if the room is still on the slide we asked about.
					if (requestedIndex !== undefined && resultsSlideIndex(currentState) === requestedIndex) {
						capturedResponses[requestedIndex] = result.newPlayerResponses;
					}
				}
			} else if ('MultipleChoice' in newMessage) {
				applyQuestionResult(
					handleMultipleChoiceMessage(newMessage.MultipleChoice, { currentState })
				);
			} else if ('TypeAnswer' in newMessage) {
				applyQuestionResult(handleTypeAnswerMessage(newMessage.TypeAnswer, { currentState }));
			} else if ('Order' in newMessage) {
				applyQuestionResult(handleOrderMessage(newMessage.Order, { currentState }));
			} else if ('Slider' in newMessage) {
				applyQuestionResult(handleSliderMessage(newMessage.Slider, { currentState }));
			} else if ('Scale' in newMessage) {
				applyQuestionResult(handleScaleMessage(newMessage.Scale, { currentState }));
			} else if ('Poll' in newMessage) {
				applyQuestionResult(handlePollMessage(newMessage.Poll, { currentState }));
			} else if ('Pin' in newMessage) {
				applyQuestionResult(handlePinMessage(newMessage.Pin, { currentState }));
			} else if ('FreeText' in newMessage) {
				applyQuestionResult(handleFreeTextMessage(newMessage.FreeText, { currentState }));
			} else if ('Brainstorm' in newMessage) {
				applyQuestionResult(handleBrainstormMessage(newMessage.Brainstorm, { currentState }));
			} else if ('InfoSlide' in newMessage) {
				applyQuestionResult(handleInfoSlideMessage(newMessage.InfoSlide, { currentState }));
			}
		});

		let intentionallyClosed = false;

		socket.addEventListener('close', async (closeEvent) => {
			if (intentionallyClosed) return;
			if (closeEvent.code === 4141) {
				location.assign('/');
			}
			if (!(currentState && 'Error' in currentState) && !finished) {
				const res = await bring(env.PUBLIC_BACKEND_URL + '/alive/' + code, {
					method: 'GET',
					mode: 'cors'
				});
				if (res === undefined) {
					currentState = {
						Error: m.connection_closed()
					};
				} else {
					let text = await res.text();
					if (text === 'true') {
						location.reload();
					} else {
						currentState = {
							Error: m.game_ended()
						};
					}
				}
			}
		});

		socket.addEventListener('open', () => {
			if (watcherId === undefined) {
				socket.send(JSON.stringify({ Ghost: 'DemandId' }));
			} else {
				socket.send(JSON.stringify({ Ghost: { ClaimId: watcherId } }));
			}
		});

		socket.addEventListener('error', () => {
			currentState = {
				Error: m.code_not_exist()
			};
		});

		sendEvent = (data: string) => {
			socket.send(data);
		};

		closeEvent = () => {
			intentionallyClosed = true;
			socket.close();
		};

		return closeEvent;
	}

	$effect(() => {
		const gameCode = code;
		return untrack(() => connectServer(gameCode));
	});

	// The screen the host is currently viewing, sent with each "Next" so the
	// server can ignore a duplicate click made before the new screen rendered.
	let currentScreen = $derived(hostScreenFromState(currentState));

	// Serialized screen of the last "Next" we sent. While the live screen still
	// equals it, the click hasn't taken effect yet, so "Next" stays disabled.
	let lastSentScreen = $state<string | null>(null);
	let nextDisabled = $derived(
		lastSentScreen !== null && JSON.stringify(currentScreen) === lastSentScreen
	);

	function onnext() {
		if (nextDisabled || currentScreen === undefined) return;
		sendEvent(JSON.stringify({ Host: { Next: currentScreen } }));
		lastSentScreen = JSON.stringify(currentScreen);
	}

	function onrequestresponses() {
		requestedIndex = resultsSlideIndex(currentState);
		sendEvent(JSON.stringify({ Host: 'RequestResponses' }));
	}

	// Pull each slide's answers as its results screen comes up, whether or not
	// the host opens the list. Waiting for a click would lose the answers of
	// every slide they clicked past, and this is the last chance to ask.
	$effect(() => {
		const index = resultsSlideIndex(currentState);
		if (index === undefined || capturedResponses[index] !== undefined) return;
		untrack(() => onrequestresponses());
	});

	setContext<HostResponses>(HOST_RESPONSES, {
		request: () => onrequestresponses(),
		get list() {
			return playerResponses;
		}
	});

	function onrequestteamrosters() {
		sendEvent(JSON.stringify({ Host: 'RequestTeamRosters' }));
	}

	setContext<HostTeamRosters>(HOST_TEAM_ROSTERS, {
		request: () => onrequestteamrosters(),
		get list() {
			return teamRosters;
		},
		get enabled() {
			return teamMode;
		},
		get formed() {
			return teamsFormed;
		}
	});

	function onlock(e: boolean) {
		sendEvent(JSON.stringify({ Host: { Lock: e } }));
	}

	function onkick(name: string) {
		sendEvent(JSON.stringify({ Host: { Kick: name } }));
	}

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'PageDown') {
				onnext();
			}
		};

		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
			closeEvent();
		};
	});
</script>

{#if currentState === undefined}
	<Loading />
{:else if 'Error' in currentState}
	<ErrorPage errorMessage={currentState.Error} />
{:else if 'Game' in currentState}
	{#if 'WaitingScreen' in currentState.Game}
		<Waiting
			{onnext}
			{onlock}
			{onkick}
			{code}
			{nextDisabled}
			players={currentState.Game.WaitingScreen}
			bind:bindableGameInfo
		/>
	{:else if 'Summary' in currentState.Game}
		{@const { stats, player_count, config, options, results, team_mapping } =
			currentState.Game.Summary}
		<Summary
			{stats}
			{player_count}
			{config}
			{options}
			{results}
			{team_mapping}
			{code}
			{capturedResponses}
			origin={getFuizOrigin(code)}
		/>
	{/if}
{:else if 'Slide' in currentState}
	{@const { Slide: slide, index, count } = currentState}
	{@const gameInfo = {
		gameCode: code,
		questionIndex: index,
		questionTotalCount: count,
		nextDisabled
	}}
	{#if 'Leaderboard' in slide}
		<Leaderboard
			{onnext}
			{onlock}
			bind:bindableGameInfo
			{gameInfo}
			current={slide.Leaderboard.current}
			prior={slide.Leaderboard.prior}
			final={index + 1 === count}
		/>
	{:else if 'MultipleChoice' in slide}
		{@const {
			MultipleChoice: kind,
			question,
			media,
			answers,
			answered_count: answeredCount,
			results
		} = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="MultipleChoice"
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<QuestionAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				answers={(answers || []).map((answerContent) => answerContent?.Text)}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={answeredCount || 0}
				{media}
			/>
		{:else if kind === 'AnswersResults'}
			<QuestionStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				answers={zip(answers || [], results || []).map(([answerContent, answerResult]) => ({
					text: answerContent?.Text || '',
					count: answerResult.count,
					correct: answerResult.correct
				}))}
				{media}
			/>
		{/if}
	{:else if 'TypeAnswer' in slide}
		{@const {
			TypeAnswer: kind,
			question,
			media,
			answers,
			results,
			case_sensitive: caseSensitive
		} = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="TypeAnswer"
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersResults'}
			<TypeAnswerStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				caseSensitive={caseSensitive ?? false}
				questionText={question || ''}
				answers={answers || []}
				results={results || []}
				{media}
			/>
		{/if}
	{:else if 'Order' in slide}
		{@const { Order: kind, question, media, answers, results, axis_labels, answered_count } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="Order"
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<OrderAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				answers={answers || []}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={answered_count ?? 0}
				{media}
				axis_labels={{
					from: axis_labels?.from || '',
					to: axis_labels?.to || ''
				}}
			/>
		{:else if kind === 'AnswersResults'}
			<OrderStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				answers={answers || []}
				results={results || [0, 0]}
				axis_labels={{
					from: axis_labels?.from || '',
					to: axis_labels?.to || ''
				}}
				{media}
			/>
		{/if}
	{:else if 'Slider' in slide}
		{@const { Slider: kind, question, media, range, unit, correct, tolerance, results } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="Slider"
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<SliderAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				range={range ?? { min: 0, max: 100, step: 1 }}
				{unit}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
				{media}
			/>
		{:else if kind === 'AnswersResults'}
			<SliderStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				range={range ?? { min: 0, max: 100, step: 1 }}
				{unit}
				correct={correct ?? 0}
				tolerance={tolerance ?? 0}
				results={results ?? {
					distribution: [],
					average: null,
					correct_count: 0,
					total_count: 0
				}}
				{media}
			/>
		{/if}
	{:else if 'Scale' in slide}
		{@const { Scale: kind, question, media, points, labels, style, results } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="Scale"
				scaleStyle={style}
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<ScaleAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				points={points ?? []}
				labels={labels ?? {}}
				style={style ?? 'Agreement'}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
				{media}
			/>
		{:else if kind === 'AnswersResults'}
			<ScaleStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				points={points ?? []}
				labels={labels ?? {}}
				style={style ?? 'Agreement'}
				results={results ?? { counts: [], average: null, total_count: 0, nps: null }}
				{media}
			/>
		{/if}
	{:else if 'Poll' in slide}
		{@const { Poll: kind, question, media, answers, results } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="Poll"
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<PollAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				answers={(answers ?? []).map((answer) => answer.Text)}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
				{media}
			/>
		{:else if kind === 'AnswersResults'}
			<PollStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				answers={(answers ?? []).map((answer) => answer.Text)}
				results={results ?? { counts: [], total_count: 0 }}
				{media}
			/>
		{/if}
	{:else if 'Pin' in slide}
		{@const { Pin: kind, question, media, correct_area, results, scored } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="Pin"
				{scored}
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<PinAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				{media}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
			/>
		{:else if kind === 'AnswersResults'}
			<PinStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				{media}
				correctShape={correct_area}
				results={results ?? { pins: [], correct_count: null, total_count: 0 }}
			/>
		{/if}
	{:else if 'FreeText' in slide}
		{@const { FreeText: kind, question, media, mode, results } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="FreeText"
				freeTextMode={mode}
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'AnswersAnnouncement'}
			<FreeTextAnswers
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				mode={mode ?? 'WordCloud'}
				maxEntries={slide.max_entries ?? 1}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
				{media}
			/>
		{:else if kind === 'AnswersResults'}
			<FreeTextStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				mode={mode ?? 'WordCloud'}
				results={results ?? { entries: [], total_entries: 0, total_count: 0 }}
				{media}
			/>
		{/if}
	{:else if 'Brainstorm' in slide}
		{@const { Brainstorm: kind, question, media, ideas, results } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionType="Brainstorm"
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{media}
				{gameInfo}
				timeStarted={initialTimer}
				questionText={question || ''}
			/>
		{:else if kind === 'IdeasAnnouncement'}
			<BrainstormIdeas
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				ideas={ideas ?? []}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
				{media}
			/>
		{:else if kind === 'VotingAnnouncement'}
			<BrainstormVoting
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				ideas={ideas ?? []}
				maxVotes={slide.max_votes ?? 1}
				timeLeft={timer}
				timeStarted={initialTimer}
				answeredCount={slide.answered_count ?? 0}
			/>
		{:else if kind === 'AnswersResults'}
			<BrainstormStatistics
				{onnext}
				{onlock}
				bind:bindableGameInfo
				{gameInfo}
				questionText={question || ''}
				results={results ?? { ideas: [], voter_count: 0, contributor_count: 0 }}
				{media}
			/>
		{/if}
	{:else if 'InfoSlide' in slide}
		<InfoSlideContent
			{onnext}
			{onlock}
			bind:bindableGameInfo
			{gameInfo}
			title={slide.title ?? ''}
			body={slide.body}
			media={slide.media}
			timeLeft={timer}
			timeStarted={initialTimer}
		/>
	{/if}
{/if}
