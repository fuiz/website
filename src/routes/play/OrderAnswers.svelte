<script>
	import * as m from '$lib/paraglide/messages.js';
	import TextBar from '$lib/game/TextBar.svelte';
	import MediaDisplay from '$lib/media/MediaDisplay.svelte';
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import downArrow from '$lib/assets/arrow-down.svg';
	import Topbar from './Topbar.svelte';
	import TextAnswerButton from '$lib/game/TextAnswerButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	/** @type {{
	 * questionText: string;
	 * name: string;
	 * score: number;
	 * media: undefined | import('$lib/types').Media;
	 * axisLabels: { from?: string; to?: string };
	 * showAnswers: boolean;
	 * answers: string[];
	 * onanswer: (answer: string[]) => void;
	}} */
	let { questionText, name, score, media, axisLabels, showAnswers, answers, onanswer } = $props();

	let answersIndexed = $state(answers.map((answer, index) => ({ answer, id: index })));

	/**
	 * @param {CustomEvent<import('svelte-dnd-action').DndEvent<{ answer: string; id: number }>>} e
	 */
	function handleConsider(e) {
		answersIndexed = e.detail.items;
	}

	/**
	 * @param {CustomEvent<import('svelte-dnd-action').DndEvent<{ answer: string; id: number }>>} e
	 */
	function handleFinalize(e) {
		answersIndexed = e.detail.items;
	}
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<div>
		<Topbar {name} {score} />
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	</div>
	<div style:flex="1">
		<NiceBackground>
			<div style:height="100%" style:display="flex" style:flex-direction="column">
				{#if media && showAnswers}
					<div style:height="40dvh">
						<MediaDisplay {media} fit="contain" />
					</div>
				{/if}
				<div
					style:display="flex"
					style:flex-direction="column"
					style:justify-content="center"
					style:gap="0.4em"
					style:padding="1em"
				>
					{#if axisLabels.from?.length}
						<div>{axisLabels.from}</div>
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
						<section
							use:dndzone={{ items: answersIndexed, flipDurationMs: 100, dropTargetStyle: {} }}
							style:display="flex"
							style:flex-direction="column"
							style:gap="0.4em"
							style:flex="1"
							onconsider={handleConsider}
							onfinalize={handleFinalize}
						>
							{#each answersIndexed as { answer, id }, actualIndex (id)}
								<div
									style:display="flex"
									style:justify-content="space-between"
									style:align-items="center"
									style:gap="0.4em"
									animate:flip={{ duration: 300 }}
								>
									<div style:flex="1">
										<TextAnswerButton answerText={answer} index={id} correct={undefined} />
									</div>
									{#if actualIndex < answersIndexed.length - 1}
										<IconButton
											src={downArrow}
											alt="Move down"
											size="1.5em"
											onclick={() => {
												answersIndexed = [
													...answersIndexed.slice(0, actualIndex),
													answersIndexed[actualIndex + 1],
													answersIndexed[actualIndex],
													...answersIndexed.slice(actualIndex + 2)
												];
											}}
										/>
									{/if}
								</div>
							{/each}
						</section>
					</div>
					{#if axisLabels.to?.length}
						<div>{axisLabels.to}</div>
					{/if}
					<FancyButton
						onclick={() => {
							onanswer(answersIndexed.map(({ answer }) => answer));
						}}
					>
						{m.submit()}
					</FancyButton>
				</div>
			</div>
		</NiceBackground>
	</div>
</div>
