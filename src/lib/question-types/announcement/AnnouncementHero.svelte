<script lang="ts">
	import McqHero from '$lib/question-types/mcq/shared/AnnouncementHero.svelte';
	import OrderHero from '$lib/question-types/order/shared/AnnouncementHero.svelte';
	import TypeAnswerHero from '$lib/question-types/type-answer/shared/AnnouncementHero.svelte';
	import type { QuestionType } from '$lib/types';

	// Picks the announcement glyph defined by each question type. The glyphs mirror
	// the real in-game UI so players recognise what's coming.
	let { questionType }: { questionType: QuestionType } = $props();
</script>

{#if questionType === 'MultipleChoice'}
	<McqHero />
{:else if questionType === 'TypeAnswer'}
	<TypeAnswerHero />
{:else}
	<OrderHero />
{/if}
