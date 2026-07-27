<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/custom/check';

	let {
		questionText,
		name,
		score,
		ideas,
		maxVotes,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		ideas: string[];
		maxVotes: number;
		showAnswers: boolean;
		onanswer: (indices: number[]) => void;
	} = $props();

	let picked = $state<number[]>([]);

	function toggle(index: number) {
		if (picked.includes(index)) {
			picked = picked.filter((i) => i !== index);
		} else if (picked.length < maxVotes) {
			picked = [...picked, index];
		}
	}
</script>

<PlayerLayout {name} {score}>
	{#snippet belowTopbar()}
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	{/snippet}
	<div class="content">
		<p class="hint">{m.brainstorm_vote_hint({ count: maxVotes })}</p>
		<ul class="ideas">
			{#each ideas as idea, index (index)}
				{@const chosen = picked.includes(index)}
				<li>
					<button
						type="button"
						class="idea"
						class:chosen
						aria-pressed={chosen}
						disabled={!chosen && picked.length >= maxVotes}
						onclick={() => toggle(index)}
					>
						<span class="text">{idea}</span>
						{#if chosen}
							<Check height="1.1em" title={m.selected()} />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
		<FancyButton disabled={picked.length === 0} onclick={() => onanswer(picked)}>
			<div class="submit">{m.submit()}</div>
		</FancyButton>
	</div>
</PlayerLayout>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		padding: 1em;
		box-sizing: border-box;
		min-height: 0;
	}

	.hint {
		margin: 0;
		text-align: center;
		font-size: 0.9em;
		opacity: 0.75;
	}

	.ideas {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4em;
	}

	.idea {
		width: 100%;
		appearance: none;
		font: inherit;
		color: inherit;
		text-align: start;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
		padding: 0.7em 0.8em;
		border-radius: 0.6em;
		border: 0.14em solid var(--outline);
		background: var(--surface-variant);
		cursor: pointer;
		overflow-wrap: anywhere;
	}

	.idea:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.idea.chosen {
		border-color: var(--primary);
		background: color-mix(in srgb, var(--primary) 15%, var(--surface-variant));
		color: var(--primary);
	}

	.text {
		flex: 1;
		min-width: 0;
	}

	.submit {
		padding: 0.2em 0.6em;
	}
</style>
