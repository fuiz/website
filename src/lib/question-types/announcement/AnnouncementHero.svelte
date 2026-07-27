<script lang="ts">
	import BrainstormHero from '$lib/question-types/brainstorm/shared/AnnouncementHero.svelte';
	import FreeTextHero from '$lib/question-types/free-text/shared/AnnouncementHero.svelte';
	import InfoSlideHero from '$lib/question-types/info-slide/shared/AnnouncementHero.svelte';
	import McqHero from '$lib/question-types/mcq/shared/AnnouncementHero.svelte';
	import OrderHero from '$lib/question-types/order/shared/AnnouncementHero.svelte';
	import PinHero from '$lib/question-types/pin/shared/AnnouncementHero.svelte';
	import PollHero from '$lib/question-types/poll/shared/AnnouncementHero.svelte';
	import ScaleHero from '$lib/question-types/scale/shared/AnnouncementHero.svelte';
	import SliderHero from '$lib/question-types/slider/shared/AnnouncementHero.svelte';
	import TypeAnswerHero from '$lib/question-types/type-answer/shared/AnnouncementHero.svelte';
	import type { QuestionType } from '$lib/types';

	// Picks the announcement glyph defined by each question type. The glyphs mirror
	// the real in-game UI so players recognise what's coming.
	let {
		questionType,
		/** For pin slides: whether there is a target to aim at. */
		scored = true
	}: { questionType: QuestionType; scored?: boolean } = $props();
</script>

{#if questionType === 'MultipleChoice'}
	<McqHero />
{:else if questionType === 'TypeAnswer'}
	<TypeAnswerHero />
{:else if questionType === 'Slider'}
	<SliderHero />
{:else if questionType === 'Pin'}
	<PinHero {scored} />
{:else if questionType === 'Poll'}
	<PollHero />
{:else if questionType === 'Scale'}
	<ScaleHero />
{:else if questionType === 'FreeText'}
	<FreeTextHero />
{:else if questionType === 'Brainstorm'}
	<BrainstormHero />
{:else if questionType === 'InfoSlide'}
	<InfoSlideHero />
{:else}
	<OrderHero />
{/if}
