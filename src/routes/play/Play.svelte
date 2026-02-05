<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { untrack } from 'svelte';
	import ChooseName from './ChooseName.svelte';
	import WaitingMobile from './WaitingMobile.svelte';
	import Question from './Question.svelte';
	import Answers from './Answers.svelte';
	import Result from './Result.svelte';
	import WaitingOthers from './WaitingOthers.svelte';
	import Leaderboard from './Leaderboard.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import { PUBLIC_BACKEND_URL, PUBLIC_WS_URL } from '$env/static/public';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import { browser } from '$app/environment';
	import Summary from './Summary.svelte';
	import { bring, zip } from '$lib/util';
	import FindTeam from './FindTeam.svelte';
	import ChooseTeammates from './ChooseTeammates.svelte';
	import TypeAnswerQuestion from './TypeAnswerQuestion.svelte';
	import OrderAnswers from './OrderAnswers.svelte';
	import {
		handleGameMessage,
		handleMultipleChoiceMessage,
		handleTypeAnswerMessage,
		handleOrderMessage
	} from './messageHandler';
	import type { IncomingMessage, State } from '.';

	let currentState = $state<State>();

	let setName = $state<string>();

	let points = $state<number>();

	let { code }: { code: string } = $props();

	let leaderboardName = $state('');

	let showAnswers = $state(false);

	let name = $derived((leaderboardName ? leaderboardName + ' - ' : '') + setName || m.you());

	let sendEvent = $state<(data: string) => void>(() => {});

	function connectServer(code: string) {
		let watcherId = (browser && localStorage.getItem(code + '_play')) || undefined;
		const socket = new WebSocket(PUBLIC_WS_URL + '/watch/' + code + '/' + (watcherId ?? 'none'));
		let finished = false;
		setName = undefined;

		// Listen for messages
		socket.addEventListener('message', (event) => {
			let newMessage: IncomingMessage = JSON.parse(event.data);

			let {
				index: previousIndex = 0,
				count: previousCount = 1,
				score: previousScore = points || 0
			} = currentState && 'Slide' in currentState ? currentState : {};

			if ('Game' in newMessage) {
				const result = handleGameMessage(newMessage.Game, {
					code,
					currentState,
					watcherId,
					previousIndex,
					previousCount,
					previousScore
				});

				if (result.newState !== undefined) {
					currentState = result.newState;
				}
				if (result.newWatcherId !== undefined) {
					watcherId = result.newWatcherId;
					localStorage.setItem(code + '_play', watcherId);
				}
				if (result.newSetName !== undefined) {
					setName = result.newSetName;
				}
				if (result.newLeaderboardName !== undefined) {
					leaderboardName = result.newLeaderboardName;
				}
				if (result.newPoints !== undefined) {
					points = result.newPoints;
				}
				if (result.newShowAnswers !== undefined) {
					showAnswers = result.newShowAnswers;
				}
				if (result.shouldMarkFinished) {
					finished = true;
				}
				if (result.shouldCloseSocket) {
					socket.close();
				}
			} else if ('MultipleChoice' in newMessage) {
				const result = handleMultipleChoiceMessage(newMessage.MultipleChoice, {
					currentState,
					previousIndex,
					previousCount,
					previousScore
				});
				if (result.newState !== undefined) {
					currentState = result.newState;
				}
			} else if ('TypeAnswer' in newMessage) {
				const result = handleTypeAnswerMessage(newMessage.TypeAnswer, {
					currentState,
					previousIndex,
					previousCount,
					previousScore
				});
				if (result.newState !== undefined) {
					currentState = result.newState;
				}
			} else if ('Order' in newMessage) {
				const result = handleOrderMessage(newMessage.Order, {
					currentState,
					previousIndex,
					previousCount,
					previousScore
				});
				if (result.newState !== undefined) {
					currentState = result.newState;
				}
			}
		});

		let intentionallyClosed = false;

		socket.addEventListener('close', async (closeEvent) => {
			if (intentionallyClosed) return;

			if (closeEvent.code === 4141) {
				location.assign('/');
			}
			if (!(currentState && 'Error' in currentState) && !finished) {
				const res = await bring(PUBLIC_BACKEND_URL + '/alive/' + code, {
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

		return () => {
			intentionallyClosed = true;
			socket.close();
		};
	}

	$effect(() => {
		const gameCode = code;

		return untrack(() => connectServer(gameCode));
	});

	function requestName(name: string) {
		currentState = {
			Game: {
				NameChoose: {
					sending: true,
					error: ''
				}
			}
		};
		sendEvent(JSON.stringify({ Unassigned: { NameRequest: name } }));
	}

	function sendAnswer(index: number) {
		if (currentState && 'Slide' in currentState && 'MultipleChoice' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: index
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { IndexAnswer: index } }));
	}

	function sendStringAnswer(text: string) {
		if (currentState && 'Slide' in currentState && 'TypeAnswer' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: text
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { StringAnswer: text } }));
	}

	function sendStringArrayAnswer(texts: string[]) {
		if (currentState && 'Slide' in currentState && 'Order' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: texts
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { StringArrayAnswer: texts } }));
	}

	function sendChooseTeammate(names: string[]) {
		sendEvent(JSON.stringify({ Player: { ChooseTeammates: names } }));
	}
</script>

{#if currentState === undefined}
	<Loading />
{:else if 'Error' in currentState}
	<ErrorPage errorMessage={currentState.Error} />
{:else if 'Game' in currentState}
	{@const game = currentState.Game}
	{#if 'NameChoose' in game}
		{@const { sending, error: errorMessage } = game.NameChoose}
		<ChooseName setName={requestName} {sending} {errorMessage} />
	{:else if 'WaitingScreen' in game}
		<WaitingMobile {name} gameCode={code} />
	{:else if 'Summary' in game}
		{@const { score, points, config } = game.Summary}
		<Summary {score} {points} {config} />
	{:else if 'FindTeam' in game}
		<FindTeam {name} gameCode={code} teamName={game.FindTeam} />
	{:else if 'ChooseTeammates' in game}
		<ChooseTeammates
			{name}
			gameCode={code}
			max={game.ChooseTeammates.max_selection - 1}
			available={game.ChooseTeammates.available.filter(([name]) => name !== setName)}
			onchoose={sendChooseTeammate}
		/>
	{/if}
{:else if 'Slide' in currentState}
	{@const { Slide: slide, index, count, score } = currentState}
	{#if 'MultipleChoice' in slide}
		{@const { MultipleChoice: kind, question, answers, media, results, answered } = slide}
		{#if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<Answers
					onanswer={sendAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
					answers={answers || []}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Result
				{name}
				{score}
				correct={answered === undefined ? false : results?.at(answered)?.correct || false}
			/>
		{/if}
	{:else if 'Score' in slide}
		{@const { points, position } = slide.Score}
		<Leaderboard {name} score={points} {position} final={index + 1 === count} />
	{:else if 'TypeAnswer' in slide}
		{@const {
			TypeAnswer: kind,
			question,
			answers,
			media,
			answered,
			accept_answers,
			case_sensitive
		} = slide}
		{#if kind === 'QuestionAnnouncement'}
			{#if answered === undefined}
				{#if accept_answers}
					<TypeAnswerQuestion
						onanswer={sendStringAnswer}
						{name}
						{score}
						{media}
						questionText={question || ''}
					/>
				{:else}
					<Question {name} {score} {media} questionText={question || ''} />
				{/if}
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Result
				{name}
				{score}
				correct={answered === undefined
					? false
					: (answers
							?.map((a) => a.trim())
							.map((a) => (case_sensitive ? a : a.toLowerCase()))
							.includes(case_sensitive ? answered.trim() : answered.trim().toLowerCase()) ?? false)}
			/>
		{/if}
	{:else if 'Order' in slide}
		{@const { Order: kind, question, answers, media, answered, axis_labels } = slide}
		{#if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<OrderAnswers
					onanswer={sendStringArrayAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
					answers={answers || []}
					axisLabels={axis_labels ?? {}}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Result
				{name}
				{score}
				correct={answered === undefined || answers === undefined
					? false
					: answers.length === answered.length && zip(answers, answered).every(([a, b]) => a === b)}
			/>
		{/if}
	{/if}
{/if}
