<script>
	import Answers from '$lib/game/Answers.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Statistics from '$lib/game/Statistics.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/game/TextBar.svelte';

	/** @type {{
	 * bindableGameInfo: import('./+page').BindableGameInfo;
	 * gameInfo: import('./+page').SharedGameInfo;
	 * questionText: string;
	 * answers: { text: string; count: number; correct: boolean }[];
	 * timeLeft?: number | undefined;
	 * timeStarted?: number | undefined;
	 * onlock?: (locked: boolean) => void;
	 * onnext?: () => void;
	}}*/
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		answers,
		timeLeft = undefined,
		timeStarted = undefined,
		onlock,
		onnext
	} = $props();

	/** @type {HTMLElement | undefined} */
	let fullscreenElement = $state();
</script>

<div
	bind:this={fullscreenElement}
	style:height="100%"
	style:display="flex"
	style:flex-direction="column"
>
	<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} {onlock} />
	<TextBar {onnext} text={questionText} showNext={true} />
	<div style:flex="1">
		<NiceBackground>
			<VerticalSplit>
				{#snippet top()}
					{#if timeLeft !== undefined && timeStarted !== undefined}
						<TimeLeft {timeLeft} {timeStarted} />
					{/if}
					<Statistics
						statistics={answers.map(({ count, correct }) => {
							return { count, correct };
						})}
					/>
				{/snippet}
				{#snippet bottom()}
					<Answers {answers} />
				{/snippet}
			</VerticalSplit>
		</NiceBackground>
	</div>
</div>
