<script lang="ts">
	import { setContext, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import ErrorPage from '$lib/feedback/ErrorPage.svelte';
	import Loading from '$lib/feedback/Loading.svelte';
	import MultipleAnswersResult from '$lib/feedback/MultipleAnswersResult.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import BrainstormIdeas from '$lib/question-types/brainstorm/player/Ideas.svelte';
	import BrainstormVoting from '$lib/question-types/brainstorm/player/Voting.svelte';
	import FreeTextAnswers from '$lib/question-types/free-text/player/Answers.svelte';
	import InfoSlideContent from '$lib/question-types/info-slide/player/Content.svelte';
	import Answers from '$lib/question-types/mcq/player/Answers.svelte';
	import { isMcqAnswerCorrect } from '$lib/question-types/mcq/shared/correctness';
	import OrderAnswers from '$lib/question-types/order/player/Answers.svelte';
	import PinAnswers from '$lib/question-types/pin/player/Answers.svelte';
	import { isPinOnTarget } from '$lib/question-types/pin/shared/correctness';
	import PollAnswers from '$lib/question-types/poll/player/Answers.svelte';
	import ScaleAnswers from '$lib/question-types/scale/player/Answers.svelte';
	import SliderAnswers from '$lib/question-types/slider/player/Answers.svelte';
	import TypeAnswerQuestion from '$lib/question-types/type-answer/player/Question.svelte';
	import type { PinPoint } from '$lib/types';
	import { bring, zip } from '$lib/util';
	import type { IncomingMessage, State } from '.';
	import ChooseName from './ChooseName.svelte';
	import ChooseTeammates from './ChooseTeammates.svelte';
	import FindTeam from './FindTeam.svelte';
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
		handleTypeAnswerMessage
	} from './messageHandler';
	import Question from './Question.svelte';
	import Recorded from './Recorded.svelte';
	import Result from './Result.svelte';
	import SlideAnnouncement from './SlideAnnouncement.svelte';
	import Summary from './Summary.svelte';
	import WaitingMobile from './WaitingMobile.svelte';
	import WaitingOthers from './WaitingOthers.svelte';

	let currentState = $state<State>();

	let setName = $state<string>();

	let points = $state<number>();

	let { code }: { code: string } = $props();

	setContext('gameCode', () => code);

	let leaderboardName = $state('');

	let showAnswers = $state(false);

	let name = $derived((leaderboardName ? leaderboardName + ' - ' : '') + setName || m.you());

	let sendEvent = $state<(data: string) => void>(() => {});

	/** Adopts a handler's new state, if it produced one. */
	function apply(result: { newState?: State }) {
		if (result.newState !== undefined) {
			currentState = result.newState;
		}
	}

	function connectServer(code: string) {
		let watcherId = (browser && localStorage.getItem(code + '_play')) || undefined;
		const socket = new WebSocket(
			env.PUBLIC_WS_URL + '/watch/' + code + '/' + (watcherId ?? 'none')
		);
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
				apply(
					handleOrderMessage(newMessage.Order, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('Slider' in newMessage) {
				apply(
					handleSliderMessage(newMessage.Slider, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('Scale' in newMessage) {
				apply(
					handleScaleMessage(newMessage.Scale, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('Poll' in newMessage) {
				apply(
					handlePollMessage(newMessage.Poll, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('Pin' in newMessage) {
				apply(
					handlePinMessage(newMessage.Pin, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('FreeText' in newMessage) {
				apply(
					handleFreeTextMessage(newMessage.FreeText, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('Brainstorm' in newMessage) {
				apply(
					handleBrainstormMessage(newMessage.Brainstorm, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
			} else if ('InfoSlide' in newMessage) {
				apply(
					handleInfoSlideMessage(newMessage.InfoSlide, {
						currentState,
						previousIndex,
						previousCount,
						previousScore
					})
				);
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

	function sendIndexArrayAnswer(indices: number[]) {
		const uniqueIndices = Array.from(new Set(indices));

		if (currentState && 'Slide' in currentState && 'MultipleChoice' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: uniqueIndices
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { IndexArrayAnswer: uniqueIndices } }));
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

	function sendNumberAnswer(value: number) {
		if (
			currentState &&
			'Slide' in currentState &&
			('Slider' in currentState.Slide || 'Scale' in currentState.Slide)
		) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: value
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { NumberAnswer: value } }));
	}

	function sendPointAnswer(point: PinPoint) {
		if (currentState && 'Slide' in currentState && 'Pin' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: point
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { PointAnswer: point } }));
	}

	function sendPollAnswer(index: number) {
		if (currentState && 'Slide' in currentState && 'Poll' in currentState.Slide) {
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

	function sendFreeTextAnswer(entries: string[]) {
		if (currentState && 'Slide' in currentState && 'FreeText' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: entries
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { StringArrayAnswer: entries } }));
	}

	function sendBrainstormIdeas(ideas: string[]) {
		if (currentState && 'Slide' in currentState && 'Brainstorm' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					contributed: ideas
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { StringArrayAnswer: ideas } }));
	}

	function sendBrainstormVotes(indices: number[]) {
		if (currentState && 'Slide' in currentState && 'Brainstorm' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: indices
				}
			};
		}

		sendEvent(JSON.stringify({ Player: { IndexArrayAnswer: indices } }));
	}

	function sendSearchTeammate(query: string) {
		sendEvent(JSON.stringify({ Player: { SearchTeammate: query } }));
	}

	function sendDeselectTeammate(name: string) {
		sendEvent(JSON.stringify({ Player: { DeselectTeammate: name } }));
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
		<WaitingMobile {name} />
	{:else if 'Summary' in game}
		{@const { score, points, config } = game.Summary}
		<Summary {score} {points} {config} />
	{:else if 'FindTeam' in game}
		<FindTeam {name} teamName={game.FindTeam} />
	{:else if 'TeammatePicker' in game}
		<ChooseTeammates
			{name}
			selected={game.TeammatePicker.selected}
			suggestions={game.TeammatePicker.suggestions}
			max_selection={game.TeammatePicker.max_selection}
			onsearch={sendSearchTeammate}
			ondeselect={sendDeselectTeammate}
		/>
	{/if}
{:else if 'Slide' in currentState}
	{@const { Slide: slide, index, count, score } = currentState}
	{#if 'MultipleChoice' in slide}
		{@const { MultipleChoice: kind, question, answers, media, results, answered, answer_mode } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement {name} {score} questionType="MultipleChoice" answerMode={answer_mode} pointsAwarded={slide.points_awarded ?? 0} />
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<Answers
					onanswer={sendAnswer}
					onarrayanswer={sendIndexArrayAnswer}
					answerMode={answer_mode}
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
				{#if answer_mode === 'MultipleAnswers'}
					<MultipleAnswersResult
						{name}
						{score}
						answers={answers || []}
						results={results || []}
						{answered}
					/>
				{:else}
					<Result {name} {score} correct={isMcqAnswerCorrect(answered, results, answer_mode)} />
				{/if}
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
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement {name} {score} questionType="TypeAnswer" pointsAwarded={slide.points_awarded ?? 0} />
		{:else if kind === 'QuestionAnnouncement'}
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
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement {name} {score} questionType="Order" pointsAwarded={slide.points_awarded ?? 0} />
		{:else if kind === 'QuestionAnnouncement'}
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
	{:else if 'Slider' in slide}
		{@const { Slider: kind, question, media, range, unit, answered, correct, tolerance } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement {name} {score} questionType="Slider" pointsAwarded={slide.points_awarded ?? 0} />
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<SliderAnswers
					onanswer={sendNumberAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
					range={range ?? { min: 0, max: 100, step: 1 }}
					{unit}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Result
				{name}
				{score}
				correct={answered !== undefined &&
					correct !== undefined &&
					Math.abs(answered - correct) <= (tolerance ?? 0) + Number.EPSILON}
			/>
		{/if}
	{:else if 'Scale' in slide}
		{@const { Scale: kind, question, media, points, labels, style, answered } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{name}
				{score}
				questionType="Scale"
				scaleStyle={style}
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<ScaleAnswers
					onanswer={sendNumberAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
					points={points ?? []}
					labels={labels ?? {}}
					style={style ?? 'Agreement'}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Recorded {name} {score} />
		{/if}
	{:else if 'Poll' in slide}
		{@const { Poll: kind, question, media, answers, answered } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement {name} {score} questionType="Poll" pointsAwarded={slide.points_awarded ?? 0} />
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<PollAnswers
					onanswer={sendPollAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
					answers={(answers ?? []).map((answer) => answer.Text)}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Recorded {name} {score} />
		{/if}
	{:else if 'Pin' in slide}
		{@const { Pin: kind, question, media, answered, scored, correct_area } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{name}
				{score}
				questionType="Pin"
				{scored}
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<PinAnswers
					onanswer={sendPointAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			{#if correct_area}
				<Result {name} {score} correct={isPinOnTarget(answered, correct_area)} />
			{:else}
				<Recorded {name} {score} />
			{/if}
		{/if}
	{:else if 'FreeText' in slide}
		{@const { FreeText: kind, question, media, mode, answered } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement
				{name}
				{score}
				questionType="FreeText"
				freeTextMode={mode}
				pointsAwarded={slide.points_awarded ?? 0}
			/>
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'AnswersAnnouncement'}
			{#if answered === undefined}
				<FreeTextAnswers
					onanswer={sendFreeTextAnswer}
					questionText={question || ''}
					{media}
					{name}
					{score}
					{showAnswers}
					mode={mode ?? 'WordCloud'}
					maxEntries={slide.max_entries ?? 1}
					maxEntryLength={slide.max_entry_length ?? 200}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Recorded {name} {score} />
		{/if}
	{:else if 'Brainstorm' in slide}
		{@const { Brainstorm: kind, question, media, ideas, answered, contributed } = slide}
		{#if kind === 'SlideAnnouncement'}
			<SlideAnnouncement {name} {score} questionType="Brainstorm" pointsAwarded={slide.points_awarded ?? 0} />
		{:else if kind === 'QuestionAnnouncement'}
			<Question {name} {score} {media} questionText={question || ''} />
		{:else if kind === 'IdeasAnnouncement'}
			{#if contributed === undefined}
				<BrainstormIdeas
					onanswer={sendBrainstormIdeas}
					questionText={question || ''}
					{name}
					{score}
					{showAnswers}
					maxIdeas={slide.max_ideas ?? 1}
					maxIdeaLength={slide.max_idea_length ?? 200}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'VotingAnnouncement'}
			{#if answered === undefined}
				<BrainstormVoting
					onanswer={sendBrainstormVotes}
					questionText={question || ''}
					{name}
					{score}
					{showAnswers}
					ideas={ideas ?? []}
					maxVotes={slide.max_votes ?? 1}
				/>
			{:else}
				<WaitingOthers {name} {score} />
			{/if}
		{:else if kind === 'AnswersResults'}
			<Recorded {name} {score} />
		{/if}
	{:else if 'InfoSlide' in slide}
		<InfoSlideContent
			{name}
			{score}
			title={slide.title ?? ''}
			body={slide.body}
			media={slide.media}
			{showAnswers}
		/>
	{/if}
{/if}
