<script>
	import Answers from '$lib/game/Answers.svelte';
	import Statistics from '$lib/game/Statistics.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import TimeLeft from '$lib/game/TimeLeft.svelte';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from '../../../../routes/[[lang]]/host/Topbar.svelte';

	/** @type {{
	 * bindableGameInfo: import('../../../../routes/[[lang]]/host/+page').BindableGameInfo;
	 * gameInfo: import('../../../../routes/[[lang]]/host/+page').SharedGameInfo;
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

<div bind:this={fullscreenElement} class="root">
	<Topbar bind:bindableGameInfo {gameInfo} {fullscreenElement} {onlock} />
	<div class="background-area">
		<NiceBackground>
			<div class="layout">
				<TextBar {onnext} text={questionText} showNext={true} />
				<div class="body">
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
							<div class="answers-large">
								<Answers {answers} />
							</div>
						{/snippet}
					</VerticalSplit>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.root {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.background-area {
		flex: 1;
		min-height: 0;
	}

	.layout {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.body {
		flex: 1;
	}

	.answers-large {
		font-size: 1.5em;
	}
</style>
