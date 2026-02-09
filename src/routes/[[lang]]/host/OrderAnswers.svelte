<script>
	import AnsweredCount from '$lib/game/AnsweredCount.svelte';
	import think from '$lib/assets/music/kevin_macleod_thinking_music.mp3';
	import MediaContainer from '$lib/media/MediaContainer.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import VerticalTripleSplit from '$lib/game/VerticalTripleSplit.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import Audio from '$lib/media/Audio.svelte';
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';

	/** @type {{
	 * bindableGameInfo: import('./+page').BindableGameInfo;
	 * gameInfo: import('./+page').SharedGameInfo;
	 * questionText: string;
	 * axis_labels: { from: string; to: string };
	 * answers: string[];
	 * timeLeft: number | undefined;
	 * timeStarted: number | undefined;
	 * answeredCount: number;
	 * media: import('$lib/types').Media | undefined;
	 * onlock?: (locked: boolean) => void;
	 * onnext?: () => void;
	}} */
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		axis_labels,
		answers,
		timeLeft,
		timeStarted,
		answeredCount,
		media,
		onlock,
		onnext
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
					<div
						style:display="flex"
						style:flex-direction="column"
						style:justify-content="center"
						style:gap="0.4em"
						style:padding="1em"
					>
						{#if axis_labels.from.length}
							<div>{axis_labels.from}</div>
						{/if}
						<div style:display="flex" style:justify-content="space-between">
							<div
								style:display="flex"
								style:align-items="center"
								style:padding="0 0.5em"
								style:flex-direction="column"
							>
								<!-- arrow body -->
								<div
									style:width="0.2em"
									style:height="100%"
									style:background-color="currentColor"
									style:box-sizing="border-box"
								></div>
								<!-- arrow head -->
								<div
									style:width="0"
									style:height="0"
									style:border-left="0.6em solid transparent"
									style:border-right="0.6em solid transparent"
									style:border-top="0.6em solid currentColor"
								></div>
							</div>
							<div
								style:display="flex"
								style:flex-direction="column"
								style:gap="0.4em"
								style:flex="1"
							>
								{#each answers as answer, index (index)}
									<TextAnswerButton answerText={answer} {index} correct={undefined} />
								{/each}
							</div>
						</div>
						{#if axis_labels.to.length}
							<div>{axis_labels.to}</div>
						{/if}
					</div>
				{/snippet}
			</VerticalTripleSplit>
		</NiceBackground>
	</div>
</div>
