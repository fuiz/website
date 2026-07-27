<script lang="ts">
	import TextBar from '$lib/game/TextBar.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import PlayerLayout from '$lib/question-types/player/PlayerLayout.svelte';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import IconButton from '$lib/ui/IconButton.svelte';
	import Textfield from '$lib/ui/Textfield.svelte';
	import Add from '~icons/material-symbols/add';
	import DeleteOutline from '~icons/material-symbols/delete-outline';

	let {
		questionText,
		name,
		score,
		maxIdeas,
		maxIdeaLength,
		showAnswers,
		onanswer
	}: {
		questionText: string;
		name: string;
		score: number;
		maxIdeas: number;
		maxIdeaLength: number;
		showAnswers: boolean;
		onanswer: (ideas: string[]) => void;
	} = $props();

	let ideas = $state<string[]>(['']);

	let filled = $derived(ideas.map((idea) => idea.trim()).filter((idea) => idea.length > 0));
</script>

<PlayerLayout {name} {score}>
	{#snippet belowTopbar()}
		{#if showAnswers}
			<TextBar text={questionText} />
		{/if}
	{/snippet}
	<form
		class="content"
		onsubmit={(event) => {
			event.preventDefault();
			if (filled.length > 0) onanswer(filled);
		}}
	>
		<p class="hint">{m.brainstorm_idea_hint({ count: maxIdeas })}</p>

		{#each ideas as _idea, index (index)}
			<div class="entry-row">
				<Textfield
					id="idea_{index}"
					placeholder={m.your_idea()}
					required={false}
					disabled={false}
					maxLength={maxIdeaLength}
					bind:value={ideas[index]}
				/>
				{#if ideas.length > 1}
					<IconButton
						alt={m.delete_answer()}
						onclick={() => (ideas = ideas.filter((_, i) => i !== index))}
					>
						<DeleteOutline height="1.25em" />
					</IconButton>
				{/if}
			</div>
		{/each}

		{#if ideas.length < maxIdeas}
			<button type="button" class="add" onclick={() => (ideas = [...ideas, ''])}>
				<Add height="1em" />
				{m.add_another()}
			</button>
		{/if}

		<FancyButton disabled={filled.length === 0} onclick={() => onanswer(filled)}>
			<div class="submit">{m.submit()}</div>
		</FancyButton>
	</form>
</PlayerLayout>

<style>
	.content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.6em;
		padding: 1.2em;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.hint {
		margin: 0;
		text-align: center;
		font-size: 0.9em;
		opacity: 0.75;
	}

	.entry-row {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.entry-row > :global(div) {
		flex: 1;
		min-width: 0;
	}

	.add {
		appearance: none;
		background: none;
		border: 1px dashed color-mix(in srgb, currentColor 40%, transparent);
		border-radius: 0.5em;
		color: inherit;
		font: inherit;
		font-size: 0.9em;
		padding: 0.4em;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3em;
	}

	.add:where(:hover, :focus-visible) {
		border-color: var(--primary);
		color: var(--primary);
		outline: none;
	}

	.submit {
		padding: 0.2em 0.6em;
	}
</style>
