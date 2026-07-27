<script lang="ts">
	import { limits } from '$lib/clientOnly';
	import * as m from '$lib/paraglide/messages.js';
	import OptionsBarLayout from '$lib/question-types/editor/OptionsBarLayout.svelte';
	import { countMap, timeMap } from '$lib/question-types/editor/optionMaps';
	import type { BrainstormSlide } from '$lib/types';
	import OptionsField from '$lib/ui/OptionsField.svelte';
	import HowToVote from '~icons/material-symbols/how-to-vote-outline';
	import Lightbulb from '~icons/material-symbols/lightbulb-outline';
	import TimerOutline from '~icons/material-symbols/timer-outline';

	let {
		activeSlide = $bindable()
	}: {
		activeSlide: BrainstormSlide;
	} = $props();
</script>

<OptionsBarLayout>
	<OptionsField
		id="brainstorm-intro"
		label={m.time_before_answers()}
		options={limits.fuiz.brainstorm.allowedIntroduceQuestion}
		map={timeMap}
		bind:selected={activeSlide.introduce_question}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="brainstorm-idea-time"
		label={m.idea_time()}
		options={limits.fuiz.brainstorm.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.idea_time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="brainstorm-vote-time"
		label={m.vote_time()}
		options={limits.fuiz.brainstorm.allowedTimeLimits}
		map={timeMap}
		bind:selected={activeSlide.vote_time_limit}
	>
		{#snippet leading()}<TimerOutline height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="brainstorm-ideas"
		label={m.ideas_per_player()}
		options={limits.fuiz.brainstorm.allowedIdeaCounts}
		map={countMap}
		bind:selected={activeSlide.max_ideas_per_player}
	>
		{#snippet leading()}<Lightbulb height="1em" />{/snippet}
	</OptionsField>
	<OptionsField
		id="brainstorm-votes"
		label={m.votes_per_player()}
		options={limits.fuiz.brainstorm.allowedVoteCounts}
		map={countMap}
		bind:selected={activeSlide.max_votes_per_player}
	>
		{#snippet leading()}<HowToVote height="1em" />{/snippet}
	</OptionsField>
</OptionsBarLayout>
