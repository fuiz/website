<script>
	import * as m from '$lib/paraglide/messages';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import Topbar from './Topbar.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import factual from '$lib/assets/correct.svg';
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import Icon from '$lib/media/Icon.svelte';
	import wrong from '$lib/assets/wrong.svg';
	import VerticalSplit from '$lib/game/VerticalSplit.svelte';

	/** @type {{
	 * bindableGameInfo: import('./+page').BindableGameInfo;
	 * gameInfo: import('./+page').SharedGameInfo;
	 * questionText: string;
	 * axis_labels: { from: string; to: string };
	 * answers: string[];
	 * results: [number, number];
	 * media: import('$lib/types').Media | undefined;
	 * onnext?: () => void;
	 * onlock?: (locked: boolean) => void;
	}} */
	let {
		bindableGameInfo = $bindable(),
		gameInfo,
		questionText,
		axis_labels,
		answers,
		results,
		onnext,
		onlock
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
	<Topbar bind:bindableGameInfo {gameInfo} {onlock} {fullscreenElement} />
	<TextBar text={questionText} showNext={true} {onnext} />
	<div style:flex="1">
		<NiceBackground>
			<VerticalSplit>
				{#snippet top()}
					<div
						style:display="flex"
						style:justify-content="center"
						style:align-items="center"
						style:font-size="2.5em"
						style:gap="1em"
						style:padding="0.2em"
					>
						<div
							style:display="inline-flex"
							style:font-family="Poppins"
							style:align-items="center"
							style:gap="0.2em"
						>
							{results[0]}
							<Icon src={factual} alt={m.correct()} size="1.25em" />
						</div>
						<div
							style:display="inline-flex"
							style:font-family="Poppins"
							style:align-items="center"
							style:gap="0.2em"
						>
							{results[1]}
							<Icon src={wrong} alt={m.wrong()} size="1.25em" />
						</div>
					</div>
				{/snippet}
				{#snippet bottom()}
					<div
						style:display="flex"
						style:flex-direction="column"
						style:justify-content="center"
						style:gap="0.4em"
						style:padding="1em"
					>
						{#if axis_labels.from}
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
								{#each answers as answer, index}
									<TextAnswerButton answerText={answer} {index} correct={undefined} />
								{/each}
							</div>
						</div>
						{#if axis_labels.to}
							<div>{axis_labels.to}</div>
						{/if}
					</div>
				{/snippet}
			</VerticalSplit>
		</NiceBackground>
	</div>
</div>
