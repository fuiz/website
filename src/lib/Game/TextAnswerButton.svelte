<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { buttonColors, buttonSymbols } from '$lib';
	import wrong from '$lib/assets/wrong.svg';
	import factual from '$lib/assets/correct.svg';
	import FancyButton from '../FancyButton.svelte';
	import Icon from '$lib/Icon.svelte';

	interface Props {
		index: number;
		answerText: string;
		correct: boolean | undefined;
		onclick?: () => void;
	}

	let { index, answerText, correct, onclick }: Props = $props();
</script>

<div style:opacity={correct === false ? '50%' : '100%'}>
	<FancyButton
		{onclick}
		backgroundColor={buttonColors.at(index % buttonColors.length)?.at(0)}
		backgroundDeepColor={buttonColors.at(index % buttonColors.length)?.at(1)}
		height="100%"
	>
		<div style:height="100%" style:width="100%" style:display="flex" style:align-items="center">
			<div id="icon" style:display="flex" style:padding="0.2em">
				<Icon
					src={buttonSymbols.at(index % buttonSymbols.length)?.at(0) ?? ''}
					alt={buttonSymbols.at(index % buttonSymbols.length)?.at(1) ?? ''}
					size="1em"
				/>
			</div>
			<div
				id="text"
				style:height="100%"
				style:flex="1"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
				style:word-break="break-word"
			>
				{answerText}
			</div>
			{#if correct === false}
				<div style:display="flex" style:padding="0.2em">
					<Icon src={wrong} alt={m.wrong()} size="1em" />
				</div>
			{:else if correct === true}
				<div style:display="flex" style:padding="0.2em">
					<Icon src={factual} alt={m.correct()} size="1em" />
				</div>
			{/if}
		</div>
	</FancyButton>
</div>
