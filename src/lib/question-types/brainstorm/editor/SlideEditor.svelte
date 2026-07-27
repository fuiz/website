<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import MediaChooser from '$lib/media/MediaChooser.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import SlideEditorLayout from '$lib/question-types/editor/SlideEditorLayout.svelte';
	import type { BrainstormSlide } from '$lib/types';
	import Textarea from '$lib/ui/Textarea.svelte';

	let {
		slide = $bindable()
	}: {
		slide: BrainstormSlide;
	} = $props();

	if (slide.idea_time_limit != null && slide.idea_time_limit < 1000) slide.idea_time_limit *= 1000;
	if (slide.vote_time_limit != null && slide.vote_time_limit < 1000) slide.vote_time_limit *= 1000;
</script>

<SlideEditorLayout>
	{#snippet media()}
		<MediaChooser bind:media={slide.media} />
	{/snippet}
	{#snippet title()}
		<Textarea
			bind:value={slide.title}
			placeholder={m.brainstorm_prompt()}
			id="question_title"
			required={false}
			disabled={false}
			maxHeight="4em"
			maxLength={limits.fuiz.brainstorm.maxTitleLength}
		/>
	{/snippet}

	<div class="editor">
		<ol class="phases">
			<li>
				<strong>{m.phase_ideas()}</strong>
				<span>{m.brainstorm_idea_hint({ count: slide.max_ideas_per_player })}</span>
			</li>
			<li>
				<strong>{m.phase_voting()}</strong>
				<span>{m.brainstorm_vote_hint({ count: slide.max_votes_per_player })}</span>
			</li>
			<li>
				<strong>{m.phase_results()}</strong>
				<span>{m.brainstorm_results_hint()}</span>
			</li>
		</ol>
		<p class="note">{m.opinion_no_correct()}</p>
	</div>
</SlideEditorLayout>

<style>
	.editor {
		width: 100%;
		max-width: 30em;
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		margin-bottom: 0.5em;
	}

	.phases {
		margin: 0;
		padding-inline-start: 1.4em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.phases li {
		display: flex;
		flex-direction: column;
	}

	.phases strong {
		font-family: var(--alternative-font);
	}

	.phases span {
		font-size: 0.85em;
		opacity: 0.7;
	}

	.note {
		margin: 0;
		text-align: center;
		font-style: italic;
		font-size: 0.8em;
		opacity: 0.6;
	}
</style>
