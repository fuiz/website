<script lang="ts">
	import { buttonSymbols } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/custom/check';
	import Close from '~icons/custom/close';

	let {
		index,
		answerText,
		correct,
		selected = false,
		dimmed = false,
		onclick
	}: {
		index: number;
		answerText: string;
		correct: boolean | undefined;
		selected?: boolean;
		dimmed?: boolean;
		onclick?: () => void;
	} = $props();

	let buttonSymbol = $derived(buttonSymbols[index % buttonSymbols.length]);
	let opacity = $derived(correct === false || dimmed ? '50%' : '100%');
</script>

<div class="root" style:--opacity={opacity}>
	<FancyButton {onclick} palette={index} height="100%">
		<div class="row">
			<div id="icon" class="icon">
				<buttonSymbol.icon title={buttonSymbol.label} height="1em" width="1em" />
			</div>
			<div id="text" class="text">
				{answerText}
			</div>
			{#if correct === false}
				<div class="icon">
					<Close height="1em" title={m.wrong()} />
				</div>
			{:else if correct === true || selected}
				<div class="icon">
					<Check height="1em" title={m.correct()} />
				</div>
			{/if}
		</div>
	</FancyButton>
</div>

<style>
	.root {
		opacity: var(--opacity);
	}

	.row {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
	}

	.icon {
		display: flex;
		padding: 0.2em;
	}

	.text {
		height: 100%;
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		word-break: break-word;
	}
</style>
