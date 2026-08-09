<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { AnswerMode, FreeTextMode, QuestionType, ScaleStyle } from '$lib/types';
	import Spotlight from './scenes/Spotlight.svelte';

	// The `Unstarted`-phase splash: announces the upcoming question's type (and
	// points, when notable) with an intro animation.
	let {
		questionType,
		answerMode,
		scaleStyle,
		freeTextMode,
		scored,
		pointsAwarded
	}: {
		questionType: QuestionType;
		// For multiple choice: whether players pick one or several answers.
		answerMode?: AnswerMode;
		// For scales: agreement and NPS are different enough to name apart.
		scaleStyle?: ScaleStyle;
		// For free text: word cloud and open ended likewise.
		freeTextMode?: FreeTextMode;
		// For pin slides: whether there is a target to aim at.
		scored?: boolean;
		pointsAwarded: number;
	} = $props();

	// Same labels the create sidebar uses for each slide type.
	const label = $derived.by(() => {
		switch (questionType) {
			case 'MultipleChoice':
				return m.multiple_choice();
			case 'TypeAnswer':
				return m.short_answer();
			case 'Order':
				return m.puzzle();
			case 'Slider':
				return m.slider();
			case 'Poll':
				return m.poll();
			case 'Scale':
				return scaleStyle === 'Nps' ? m.nps_scale() : m.scale();
			case 'Pin':
				return scored === false ? m.drop_pin() : m.pin_answer();
			case 'FreeText':
				return freeTextMode === 'OpenEnded' ? m.open_ended() : m.word_cloud();
			case 'Brainstorm':
				return m.brainstorm();
			case 'InfoSlide':
				return m.info_slide();
		}
	});

	// A one-line clarifier under the type label, where the type has a variant
	// worth naming or scoring worth setting expectations about.
	const subtext = $derived.by(() => {
		if (questionType === 'MultipleChoice' && answerMode) {
			return answerMode === 'MultipleAnswers' ? m.multiple_answers() : m.single_answer();
		}
		if (
			questionType === 'Poll' ||
			questionType === 'Scale' ||
			questionType === 'FreeText' ||
			questionType === 'Brainstorm' ||
			(questionType === 'Pin' && scored === false)
		) {
			return m.collect_opinions();
		}
		return undefined;
	});
</script>

<div class="announcement">
	<Spotlight {questionType} {label} {subtext} {scored} {pointsAwarded} />
</div>

<style>
	.announcement {
		height: 100%;
		width: 100%;
		position: relative;
		overflow: hidden;
		color: var(--on-surface);
		/* Size container the scene scales against: full-screen on host/play,
		   thumbnail-sized in the demo grid. */
		container-type: size;
		container-name: announce;
	}
</style>
