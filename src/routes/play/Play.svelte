<script>
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

	/** @type {import('./index').State | undefined} */
	let currentState = $state(undefined);

	/** @type {WebSocket} */
	let socket;

	/** @type {string | undefined} */
	let setName = $state(undefined);

	/** @type {number | undefined} */
	let points = $state(undefined);

	/** @type {{code: string;}} */
	let { code } = $props();

	let finished = false;

	let leaderboardName = $state('');

	let showAnswers = $state(false);

	let watcherId = (browser && localStorage.getItem(code + '_play')) || undefined;

	/** @param {string} code */
	function connectServer(code) {
		socket = new WebSocket(PUBLIC_WS_URL + '/watch/' + code + '/' + (watcherId ?? 'none'));
		setName = undefined;

		// // Listen for messages
		socket.addEventListener('message', (event) => {
			/** @type {import('./index').IncomingMessage} */
			let newMsg = JSON.parse(event.data);

			let {
				index: previousIndex = 0,
				count: previousCount = 1,
				score: previousScore = points || 0
			} = currentState && 'Slide' in currentState ? currentState : {};

			if ('Game' in newMsg) {
				if (newMsg.Game === 'NameChoose') {
					currentState = {
						Game: {
							NameChoose: {
								sending: false,
								error: ''
							}
						}
					};
				} else if ('NameAssign' in newMsg.Game) {
					currentState = undefined;
					setName = newMsg.Game.NameAssign;
				} else if ('NameError' in newMsg.Game) {
					let errorMessage = '';
					if (newMsg.Game.NameError === 'Used') {
						errorMessage = m.in_use();
					} else if (newMsg.Game.NameError === 'Assigned') {
						errorMessage = m.have_name();
					} else if (newMsg.Game.NameError === 'Empty') {
						errorMessage = m.cannot_empty();
					} else if (newMsg.Game.NameError === 'Sinful') {
						errorMessage = m.inappropriate();
					} else if (newMsg.Game.NameError === 'TooLong') {
						errorMessage = m.too_long();
					}
					currentState = {
						Game: {
							NameChoose: {
								sending: false,
								error: errorMessage
							}
						}
					};
				} else if ('Score' in newMsg.Game) {
					let {
						index = previousIndex,
						count = previousCount,
						score: { points, position } = {
							points: previousScore,
							position: undefined
						}
					} = newMsg.Game.Score;

					currentState = {
						index,
						count,
						score: points,
						Slide: {
							Score: {
								points,
								position
							}
						}
					};
				} else if ('WaitingScreen' in newMsg.Game) {
					let { exact_count } = newMsg.Game.WaitingScreen;
					currentState = {
						Game: {
							WaitingScreen: {
								exact_count
							}
						}
					};
				} else if ('IdAssign' in newMsg.Game) {
					watcherId = newMsg.Game.IdAssign;
					localStorage.setItem(code + '_play', watcherId);
				} else if ('Metainfo' in newMsg.Game) {
					let { score, show_answers } = newMsg.Game.Metainfo.Player;
					points = score;
					showAnswers = show_answers;
				} else if ('Summary' in newMsg.Game) {
					finished = true;
					currentState = {
						Game: {
							Summary: newMsg.Game.Summary.Player
						}
					};
					socket.close();
				} else if ('FindTeam' in newMsg.Game) {
					currentState = {
						Game: {
							FindTeam: newMsg.Game.FindTeam
						}
					};
					leaderboardName = newMsg.Game.FindTeam;
				} else if ('ChooseTeammates' in newMsg.Game) {
					currentState = {
						Game: {
							ChooseTeammates: newMsg.Game.ChooseTeammates
						}
					};
				}
			} else if ('MultipleChoice' in newMsg) {
				let mc = newMsg.MultipleChoice;

				let previous_state =
					currentState && 'Slide' in currentState && 'MultipleChoice' in currentState.Slide
						? currentState.Slide
						: undefined;

				if ('QuestionAnnouncement' in mc) {
					let { index, count, question, media } = mc.QuestionAnnouncement;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							MultipleChoice: 'QuestionAnnouncement',
							question,
							media
						}
					};
				} else if ('AnswersAnnouncement' in mc) {
					let {
						index = previousIndex,
						count = previousCount,
						question = previous_state?.question,
						media = previous_state?.media,
						answers
					} = mc.AnswersAnnouncement;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							MultipleChoice: 'AnswersAnnouncement',
							question,
							media,
							answers: answers.map((a) => {
								if (a === 'Hidden') return undefined;
								return a.Visible;
							})
						}
					};
				} else if ('AnswersResults' in mc) {
					let {
						index = previousIndex,
						count = previousCount,
						question = previous_state?.question,
						media = previous_state?.media,
						answers,
						results
					} = mc.AnswersResults;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							MultipleChoice: 'AnswersResults',
							question,
							media,
							answers,
							results,
							answered: previous_state?.answered
						}
					};
				}
			} else if ('TypeAnswer' in newMsg) {
				let ta = newMsg.TypeAnswer;

				let previous_state =
					currentState && 'Slide' in currentState && 'TypeAnswer' in currentState.Slide
						? currentState.Slide
						: undefined;

				if ('QuestionAnnouncement' in ta) {
					let { index, count, question, media, accept_answers } = ta.QuestionAnnouncement;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							TypeAnswer: 'QuestionAnnouncement',
							question,
							media,
							accept_answers
						}
					};
				} else if ('AnswersResults' in ta) {
					let {
						index = previousIndex,
						count = previousCount,
						question = previous_state?.question,
						media = previous_state?.media,
						answers,
						results,
						case_sensitive
					} = ta.AnswersResults;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							TypeAnswer: 'AnswersResults',
							question,
							media,
							answers,
							results,
							case_sensitive,
							answered: previous_state?.answered
						}
					};
				}
			} else if ('Order' in newMsg) {
				let ta = newMsg.Order;

				let previous_state =
					currentState && 'Slide' in currentState && 'Order' in currentState.Slide
						? currentState.Slide
						: undefined;

				if ('QuestionAnnouncement' in ta) {
					let { index, count, question, media } = ta.QuestionAnnouncement;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							Order: 'QuestionAnnouncement',
							question,
							media
						}
					};
				} else if ('AnswersAnnouncement' in ta) {
					let {
						index = previousIndex,
						count = previousCount,
						question = previous_state?.question,
						media = previous_state?.media,
						answers,
						axis_labels
					} = ta.AnswersAnnouncement;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							Order: 'AnswersAnnouncement',
							question,
							media,
							answers,
							axis_labels,
							answered: previous_state?.answered
						}
					};
				} else if ('AnswersResults' in ta) {
					let {
						index = previousIndex,
						count = previousCount,
						question = previous_state?.question,
						media = previous_state?.media,
						axis_labels = previous_state?.axis_labels,
						answers,
						results
					} = ta.AnswersResults;
					currentState = {
						index,
						count,
						score: previousScore,
						Slide: {
							Order: 'AnswersResults',
							question,
							media,
							answers,
							results,
							answered: previous_state?.answered,
							axis_labels
						}
					};
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

		return () => {
			intentionallyClosed = true;
			socket.close();
		};
	}

	$effect(() => {
		const gameCode = code;

		return untrack(() => connectServer(gameCode));
	});

	let name = $derived((leaderboardName ? leaderboardName + ' - ' : '') + setName || m.you());

	/** @param {string} name */
	function requestName(name) {
		currentState = {
			Game: {
				NameChoose: {
					sending: true,
					error: ''
				}
			}
		};
		socket.send(JSON.stringify({ Unassigned: { NameRequest: name } }));
	}

	/** @param {number} index */
	function sendAnswer(index) {
		if (currentState && 'Slide' in currentState && 'MultipleChoice' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: index
				}
			};
		}

		socket.send(JSON.stringify({ Player: { IndexAnswer: index } }));
	}

	/** @param {string} text */
	function sendStringAnswer(text) {
		if (currentState && 'Slide' in currentState && 'TypeAnswer' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: text
				}
			};
		}

		socket.send(JSON.stringify({ Player: { StringAnswer: text } }));
	}

	/** @param {string[]} texts */
	function sendStringArrayAnswer(texts) {
		if (currentState && 'Slide' in currentState && 'Order' in currentState.Slide) {
			currentState = {
				...currentState,
				Slide: {
					...currentState.Slide,
					answered: texts
				}
			};
		}

		socket.send(JSON.stringify({ Player: { StringArrayAnswer: texts } }));
	}

	/** @param {string[]} names */
	function sendChooseTeammate(names) {
		socket.send(JSON.stringify({ Player: { ChooseTeammates: names } }));
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
