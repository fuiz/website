<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Waiting from './Waiting.svelte';
	import Question from './Question.svelte';
	import QuestionAnswers from './QuestionAnswers.svelte';
	import QuestionStatistics from './QuestionStatistics.svelte';
	import {
		type Media,
		type TextOrMedia,
		type AnswerResult,
		type IdlessFuizConfig,
		type FuizOptions,
		type ServerPossiblyHidden
	} from '$lib/types';
	import Leaderboard from './Leaderboard.svelte';
	import Loading from '$lib/Loading.svelte';
	import { PUBLIC_BACKEND_URL, PUBLIC_WS_URL } from '$env/static/public';
	import ErrorPage from '$lib/ErrorPage.svelte';
	import type { BindableGameInfo, TruncatedList } from './+page';
	import Summary from './Summary.svelte';
	import { bring, zip } from '$lib/util';
	import TypeAnswerStatistics from './TypeAnswerStatistics.svelte';
	import OrderAnswers from './OrderAnswers.svelte';
	import OrderStatistics from './OrderStatistics.svelte';
	import { onMount, untrack } from 'svelte';

	type GameState =
		| {
				WaitingScreen: TruncatedList<string>;
		  }
		| {
				Summary: {
					stats: [number, number][];
					player_count: number;
					config: IdlessFuizConfig;
					options: FuizOptions;
				};
		  };

	type SlideState =
		| {
				MultipleChoice: 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

				question?: string;
				media?: Media;
				answers?: (TextOrMedia | undefined)[];
				answered_count?: number;
				results?: AnswerResult[];
		  }
		| {
				TypeAnswer: 'QuestionAnnouncement' | 'AnswersResults';

				question?: string;
				media?: Media;
				answers?: string[];
				answered_count?: number;
				results?: [string, number][];
				accept_answers?: boolean;
				case_sensitive?: boolean;
		  }
		| {
				Order: 'QuestionAnnouncement' | 'AnswersAnnouncement' | 'AnswersResults';

				question?: string;
				media?: Media;
				answers?: string[];
				answered_count?: number;
				results?: [number, number];
				axis_labels?: {
					from?: string;
					to?: string;
				};
		  }
		| {
				Leaderboard: {
					current: TruncatedList<[string, number]>;
					prior: TruncatedList<[string, number]>;
				};
		  };

	type State =
		| {
				Game: GameState;
		  }
		| {
				index: number;
				count: number;
				Slide: SlideState;
		  }
		| {
				Error: string;
		  };

	type GameIncomingMessage =
		| {
				IdAssign: string;
		  }
		| {
				WaitingScreen: TruncatedList<string>;
		  }
		| {
				TeamDisplay: TruncatedList<string>;
		  }
		| {
				Leaderboard: {
					index?: number;
					count?: number;
					leaderboard: {
						current: TruncatedList<[string, number]>;
						prior: TruncatedList<[string, number]>;
					};
				};
		  }
		| {
				Metainfo: {
					Host: {
						locked: boolean;
					};
				};
		  }
		| {
				Summary: {
					Host: {
						stats: [number, number][];
						player_count: number;
						config: IdlessFuizConfig;
						options: FuizOptions;
					};
				};
		  };

	type MultipleChoiceIncomingMessage =
		| {
				QuestionAnnouncement: {
					index: number;
					count: number;
					question: string;
					media?: Media;
					duration: number;
				};
		  }
		| {
				AnswersAnnouncement: {
					index?: number;
					count?: number;
					question?: string;
					media?: Media;
					answers: Array<ServerPossiblyHidden<TextOrMedia>>;
					answered_count?: number;
					duration: number;
				};
		  }
		| {
				AnswersCount: number;
		  }
		| {
				AnswersResults: {
					index?: number;
					count?: number;
					question?: string;
					media?: Media;
					answers: Array<TextOrMedia>;
					results: Array<AnswerResult>;
				};
		  };

	type TypeAnswerIncomingMessage =
		| {
				QuestionAnnouncement: {
					index: number;
					count: number;
					question: string;
					media?: Media;
					duration: number;
					accept_answers: boolean;
				};
		  }
		| {
				AnswersCount: number;
		  }
		| {
				AnswersResults: {
					index?: number;
					count?: number;
					question?: string;
					media?: Media;
					answers: Array<string>;
					results: Array<[string, number]>;
					case_sensitive: boolean;
				};
		  };

	type OrderSlideIncomingMessage =
		| {
				QuestionAnnouncement: {
					index: number;
					count: number;
					question: string;
					media?: Media;
					duration: number;
				};
		  }
		| {
				AnswersAnnouncement: {
					index?: number;
					count?: number;
					question?: string;
					media?: Media;
					answered_count?: number;
					duration: number;
					answers: string[];
					axis_labels: {
						from?: string;
						to?: string;
					};
				};
		  }
		| {
				AnswersResults: {
					index?: number;
					count?: number;
					question?: string;
					media?: Media;
					axis_labels?: {
						from?: string;
						to?: string;
					};
					answers: string[];
					results: [number, number];
				};
		  };

	type IncomingMessage =
		| {
				Game: GameIncomingMessage;
		  }
		| {
				MultipleChoice: MultipleChoiceIncomingMessage;
		  }
		| {
				TypeAnswer: TypeAnswerIncomingMessage;
		  }
		| {
				Order: OrderSlideIncomingMessage;
		  };

	let currentState: State | undefined = $state(undefined);

	let socket: WebSocket;

	let timer = $state(0);
	let initialTimer = $state(0);

	const UPDATE_DURATION = 100;

	setInterval(() => {
		timer = Math.max(0, timer - UPDATE_DURATION);
	}, UPDATE_DURATION);

	interface Props {
		code: string;
	}

	let { code }: Props = $props();

	let watcherId: string | undefined = undefined;

	let bindableGameInfo: BindableGameInfo = $state({
		volumeOn: true,
		locked: false
	});

	let finished = false;

	function connectServer(code: string) {
		watcherId = localStorage.getItem(code + '_host') || undefined;
		socket = new WebSocket(PUBLIC_WS_URL + '/watch/' + code + '/' + (watcherId ?? ''));

		currentState = undefined;
		bindableGameInfo = {
			volumeOn: bindableGameInfo.volumeOn,
			locked: false
		};
		finished = false;

		// Listen for messages
		socket.addEventListener('message', (event) => {
			let new_msg: IncomingMessage = JSON.parse(event.data);

			if ('Game' in new_msg) {
				if ('WaitingScreen' in new_msg.Game) {
					currentState = {
						Game: {
							WaitingScreen: new_msg.Game.WaitingScreen
						}
					};
				} else if ('TeamDisplay' in new_msg.Game) {
					currentState = {
						Game: {
							WaitingScreen: new_msg.Game.TeamDisplay
						}
					};
				} else if ('Leaderboard' in new_msg.Game) {
					let { index: previous_index = 0, count: previous_count = 1 } =
						currentState && 'Slide' in currentState ? currentState : {};

					currentState = {
						index: new_msg.Game.Leaderboard.index || previous_index,
						count: new_msg.Game.Leaderboard.count || previous_count,
						Slide: {
							Leaderboard: new_msg.Game.Leaderboard.leaderboard
						}
					};
				} else if ('IdAssign' in new_msg.Game) {
					watcherId = new_msg.Game.IdAssign;
					localStorage.setItem(code + '_host', watcherId);
				} else if ('Metainfo' in new_msg.Game) {
					bindableGameInfo.locked = new_msg.Game.Metainfo.Host.locked;
				} else if ('Summary' in new_msg.Game) {
					currentState = {
						Game: {
							Summary: new_msg.Game.Summary.Host
						}
					};
					finished = true;
					socket.close();
				}
			} else if ('MultipleChoice' in new_msg) {
				let mc = new_msg.MultipleChoice;

				let previous_state =
					currentState && 'Slide' in currentState && 'MultipleChoice' in currentState.Slide
						? currentState.Slide
						: undefined;

				let { index: previous_index = 0, count: previous_count = 1 } =
					currentState && 'Slide' in currentState ? currentState : {};

				if ('QuestionAnnouncement' in mc) {
					let { index, count, question, media, duration } = mc.QuestionAnnouncement;
					currentState = {
						index,
						count,
						Slide: {
							MultipleChoice: 'QuestionAnnouncement',
							question,
							media
						}
					};
					timer = duration;
					initialTimer = duration;
				} else if ('AnswersAnnouncement' in mc) {
					let {
						index = previous_index,
						count = previous_count,
						question = previous_state?.question,
						media = previous_state?.media,
						duration,
						answers,
						answered_count
					} = mc.AnswersAnnouncement;
					currentState = {
						index,
						count,
						Slide: {
							MultipleChoice: 'AnswersAnnouncement',
							question,
							media,
							answers: answers.map((a) => {
								if (a == 'Hidden') return undefined;
								return a.Visible;
							}),
							answered_count
						}
					};
					timer = duration;
					initialTimer = duration;
				} else if ('AnswersCount' in mc) {
					currentState = {
						...(currentState || { index: previous_index, count: previous_count }),
						Slide: {
							...previous_state,
							MultipleChoice: previous_state?.MultipleChoice ?? 'AnswersAnnouncement',
							answered_count: mc.AnswersCount
						}
					};
				} else if ('AnswersResults' in mc) {
					let {
						index = previous_index,
						count = previous_count,
						question = previous_state?.question,
						media = previous_state?.media,
						answers,
						results
					} = mc.AnswersResults;
					currentState = {
						index,
						count,
						Slide: {
							MultipleChoice: 'AnswersResults',
							question,
							media,
							answers,
							results
						}
					};
				}
			} else if ('TypeAnswer' in new_msg) {
				let ta = new_msg.TypeAnswer;

				let previous_state =
					currentState && 'Slide' in currentState && 'TypeAnswer' in currentState.Slide
						? currentState.Slide
						: undefined;

				let { index: previous_index = 0, count: previous_count = 1 } =
					currentState && 'Slide' in currentState ? currentState : {};

				if ('QuestionAnnouncement' in ta) {
					let { index, count, question, media, duration, accept_answers } = ta.QuestionAnnouncement;
					currentState = {
						index,
						count,
						Slide: {
							TypeAnswer: 'QuestionAnnouncement',
							question,
							media,
							accept_answers
						}
					};
					timer = duration;
					initialTimer = duration;
				} else if ('AnswersCount' in ta) {
					currentState = {
						...(currentState || { index: previous_index, count: previous_count }),
						Slide: {
							...previous_state,
							TypeAnswer: previous_state?.TypeAnswer ?? 'QuestionAnnouncement'
						}
					};
				} else if ('AnswersResults' in ta) {
					let {
						index = previous_index,
						count = previous_count,
						question = previous_state?.question,
						media = previous_state?.media,
						answers,
						results,
						case_sensitive
					} = ta.AnswersResults;
					currentState = {
						index,
						count,
						Slide: {
							TypeAnswer: 'AnswersResults',
							question,
							media,
							answers,
							results,
							case_sensitive
						}
					};
				}
			} else if ('Order' in new_msg) {
				let order = new_msg.Order;

				let previous_state =
					currentState && 'Slide' in currentState && 'Order' in currentState.Slide
						? currentState.Slide
						: undefined;

				let { index: previous_index = 0, count: previous_count = 1 } =
					currentState && 'Slide' in currentState ? currentState : {};

				if ('QuestionAnnouncement' in order) {
					let { index, count, question, media, duration } = order.QuestionAnnouncement;
					currentState = {
						index,
						count,
						Slide: {
							Order: 'QuestionAnnouncement',
							question,
							media
						}
					};
					timer = duration;
					initialTimer = duration;
				} else if ('AnswersAnnouncement' in order) {
					let {
						index = previous_index,
						count = previous_count,
						question = previous_state?.question,
						media = previous_state?.media,
						answered_count = previous_state?.answered_count,
						duration,
						answers,
						axis_labels
					} = order.AnswersAnnouncement;
					currentState = {
						index,
						count,
						Slide: {
							Order: 'AnswersAnnouncement',
							question,
							media,
							answers,
							answered_count,
							axis_labels
						}
					};
					timer = duration;
					initialTimer = duration;
				} else if ('AnswersResults' in order) {
					let {
						index = previous_index,
						count = previous_count,
						question = previous_state?.question,
						media = previous_state?.media,
						axis_labels = previous_state?.axis_labels,
						answers,
						results
					} = order.AnswersResults;
					currentState = {
						index,
						count,
						Slide: {
							Order: 'AnswersResults',
							question,
							media,
							answers,
							results,
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

	function onnext() {
		socket.send(HOST_NEXT);
	}

	function onlock(e: boolean) {
		socket.send(JSON.stringify({ Host: { Lock: e } }));
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
			socket.close();
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
		{@const { stats, player_count, config, options } = currentState.Game.Summary}
		<Summary {stats} {player_count} {config} {options} />
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
