<script>
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import Answers from '$lib/game/Answers.svelte';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import VerticalTripleSplit from '$lib/game/VerticalTripleSplit.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import Audio from '$lib/media/Audio.svelte';

	/** @type {{bindableGameInfo: import('./+page').BindableGameInfo, gameInfo: import('./+page').SharedGameInfo, questionText: string, answers: (string | undefined)[], timeLeft: number | undefined, timeStarted: number | undefined, answeredCount: number, media: import('$lib/types').Media | undefined, onlock?: (locked: boolean) => void, onnext?: () => void, onanswer?: (answer: number) => void}}*/
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		timeLeft,
		timeStarted,
		answeredCount,
		media,
		onlock,
		onnext,
		onanswer
	} = $props();

	/** @type {HTMLElement | undefined} */
	let fullscreenElement = $state();
</script>

<Audio audioUrl={think} volumeOn={bindableGameInfo.volumeOn} />
<div
	bind:this={fullscreenElement}
	style:height="100%"
	style:display="flex"
	style:flex-direction="column"
>
	<Topbar bind:bindableGameInfo {gameInfo} {onlock} {onnext} {fullscreenElement} showSkip={true} />
	<TextBar text={questionText} />
	<div style:flex="1">
		<NiceBackground>
			<VerticalTripleSplit>
				{#snippet top()}
					<div
						style:display="flex"
						style:justify-content="space-between"
						style:z-index="1"
						style:padding="0.4em"
					>
						{#if timeLeft !== undefined && timeStarted !== undefined}
							<TimeLeft {timeLeft} {timeStarted} />
						{/if}
						<AnsweredCount {answeredCount} />
					</div>
				{/snippet}
				{#snippet center()}
					<MediaContainer {media} showFallback={false} />
				{/snippet}
				{#snippet bottom()}
					<Answers
						{onanswer}
						answers={answers.map((a) => {
							if (a === undefined) return { text: '?', correct: undefined };
							return { text: a, correct: undefined };
						})}
					/>
				{/snippet}
			</VerticalTripleSplit>
		</NiceBackground>
	</div>
</div>
