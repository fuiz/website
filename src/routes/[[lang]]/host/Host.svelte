<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { PUBLIC_BACKEND_URL, PUBLIC_WS_URL } from '$env/static/public';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { bring, zip } from '$lib/util';
	import type { IncomingMessage, State } from '.';
	import type { BindableGameInfo } from './+page';
	import Leaderboard from './Leaderboard.svelte';
	import {
		handleGameMessage,
		handleMultipleChoiceMessage,
		handleOrderMessage,
		handleTypeAnswerMessage,
		type QuestionMessageResult
	} from './messageHandler';
	import OrderAnswers from './OrderAnswers.svelte';
	import OrderStatistics from './OrderStatistics.svelte';
	import Question from './Question.svelte';
	import QuestionAnswers from './QuestionAnswers.svelte';
	import QuestionStatistics from './QuestionStatistics.svelte';
	import Summary from './Summary.svelte';
	import TypeAnswerStatistics from './TypeAnswerStatistics.svelte';
	import Waiting from './Waiting.svelte';

	let currentState = $state<State>();

	let timer = $state(0);
	let initialTimer = $state(0);

	const UPDATE_DURATION = 100;

	setInterval(() => {
		timer = Math.max(0, timer - UPDATE_DURATION);
	}, UPDATE_DURATION);

	let { code }: { code: string } = $props();

	let bindableGameInfo = $state<BindableGameInfo>({
		volumeOn: true,
		locked: false
	});

	function applyQuestionResult(result: QuestionMessageResult) {
		if (result.newState !== undefined) {
			currentState = result.newState;
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
		let socket = new WebSocket(PUBLIC_WS_URL + '/watch/' + code + '/' + (watcherId ?? ''));

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
				if (result.shouldMarkFinished) {
					finished = true;
				}
				if (result.shouldCloseSocket) {
					socket.close();
				}
			} else if ('MultipleChoice' in newMessage) {
				applyQuestionResult(
					handleMultipleChoiceMessage(newMessage.MultipleChoice, { currentState })
				);
			} else if ('TypeAnswer' in newMessage) {
				applyQuestionResult(handleTypeAnswerMessage(newMessage.TypeAnswer, { currentState }));
			} else if ('Order' in newMessage) {
				applyQuestionResult(handleOrderMessage(newMessage.Order, { currentState }));
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

	function onnext() {
		sendEvent(HOST_NEXT);
	}

	function onlock(e: boolean) {
		sendEvent(JSON.stringify({ Host: { Lock: e } }));
	}

	const HOST_NEXT = JSON.stringify({ Host: 'Next' });

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
			{code}
			players={currentState.Game.WaitingScreen.items}
			exact_count={currentState.Game.WaitingScreen.exact_count}
			bind:bindableGameInfo
		/>
	{:else if 'Summary' in currentState.Game}
		{@const { stats, player_count, config, options, results } = currentState.Game.Summary}
		<Summary {stats} {player_count} {config} {options} {results} />
	{/if}
{:else if 'Slide' in currentState}
	{@const { Slide: slide, index, count } = currentState}
	{@const gameInfo = {
		gameCode: code,
		questionIndex: index,
		questionTotalCount: count
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
		{#if kind === 'QuestionAnnouncement'}
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
		{#if kind === 'QuestionAnnouncement'}
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
			/>
		{/if}
	{:else if 'Order' in slide}
		{@const { Order: kind, question, media, answers, results, axis_labels, answered_count } = slide}
		{#if kind === 'QuestionAnnouncement'}
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
	{/if}
{/if}
