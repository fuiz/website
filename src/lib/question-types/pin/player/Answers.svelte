<script lang="ts">
	import PinBoard from '$lib/game/PinBoard.svelte';
	import TextBar from '$lib/game/TextBar.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import type { Media, PinPoint } from '$lib/types';
	import FancyButton from '$lib/ui/FancyButton.svelte';

	let {
		questionText,
		name,
		score,
		media,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		media: Media | undefined;
		showAnswers: boolean;
		onanswer: (point: PinPoint) => void;
	} = $props();

	let pin = $state<PinPoint | undefined>(undefined);
</script>

<PlayerLayout {name} {score}>
	{#snippet belowTopbar()}
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	{/snippet}
	<div class="stack">
		<div class="board">
			<PinBoard {media} myPin={pin} interactive onpick={(point) => (pin = point)} />
		</div>
		<div class="actions">
			<p class="hint">{pin ? m.pin_move_hint() : m.pin_place_hint()}</p>
			<FancyButton disabled={pin === undefined} onclick={() => pin && onanswer(pin)}>
				<div class="submit">{m.submit()}</div>
			</FancyButton>
		</div>
	</div>
</PlayerLayout>

<style>
	.stack {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.board {
		flex: 1;
		min-height: 0;
		padding: 0.5em;
		box-sizing: border-box;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		padding: 0.6em 1em 1em;
	}

	.hint {
		margin: 0;
		text-align: center;
		font-size: 0.9em;
		opacity: 0.75;
	}

	.submit {
		padding: 0.2em 0.6em;
	}
</style>
