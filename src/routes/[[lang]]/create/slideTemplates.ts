import type { Component } from 'svelte';
import { limits } from '$lib/clientOnly';
import * as m from '$lib/paraglide/messages.js';
import type { Slide } from '$lib/types';
import ArticleOutline from '~icons/material-symbols/article-outline';
import ChatBubbleOutline from '~icons/material-symbols/chat-bubble-outline';
import CheckBoxOutline from '~icons/material-symbols/check-box-outline';
import CloudOutline from '~icons/material-symbols/cloud-outline';
import KeyboardOutline from '~icons/material-symbols/keyboard-outline';
import LightbulbOutline from '~icons/material-symbols/lightbulb-outline';
import LinearScale from '~icons/material-symbols/linear-scale';
import LocationOnOutline from '~icons/material-symbols/location-on-outline';
import PieChartOutline from '~icons/material-symbols/pie-chart-outline';
import PinDropOutline from '~icons/material-symbols/pin-drop-outline';
import Rule from '~icons/material-symbols/rule';
import SentimentSatisfiedOutline from '~icons/material-symbols/sentiment-satisfied-outline';
import SwapVert from '~icons/material-symbols/swap-vert';
import Tune from '~icons/material-symbols/tune';

/**
 * The three families the add-slide picker groups by: questions that have a right
 * answer, questions that just gather what the room thinks, and slides that only
 * present something.
 */
export type SlideGroup = 'test' | 'opinion' | 'present';

export type SlideTemplate = {
	/** Stable key, used for `{#each}` and for tests. */
	key: string;
	group: SlideGroup;
	icon: Component;
	label: () => string;
	description: () => string;
	/** Builds a fresh slide. `id` is the caller's new slide id. */
	create: (id: number) => Slide;
};

const question = {
	multipleChoice: limits.fuiz.multipleChoice,
	typeAnswer: limits.fuiz.typeAnswer,
	order: limits.fuiz.order,
	slider: limits.fuiz.slider,
	scale: limits.fuiz.scale,
	poll: limits.fuiz.poll,
	pin: limits.fuiz.pin,
	freeText: limits.fuiz.freeText,
	brainstorm: limits.fuiz.brainstorm,
	infoSlide: limits.fuiz.infoSlide
};

export const slideTemplates: SlideTemplate[] = [
	// --- Test knowledge ---
	{
		key: 'quiz',
		group: 'test',
		icon: CheckBoxOutline,
		label: m.multiple_choice,
		description: m.multiple_choice_desc,
		create: (id) => ({
			MultipleChoice: {
				title: '',
				media: undefined,
				introduce_question: question.multipleChoice.introduceQuestion,
				time_limit: question.multipleChoice.defaultTimeLimit,
				points_awarded: question.multipleChoice.pointsAwarded,
				answers: []
			},
			id
		})
	},
	{
		key: 'true-false',
		group: 'test',
		icon: Rule,
		label: m.true_or_false,
		description: m.true_or_false_desc,
		// A true/false question is a two-option quiz; pre-filling the options is
		// the whole difference, so it shares the multiple-choice slide type.
		create: (id) => ({
			MultipleChoice: {
				title: '',
				media: undefined,
				introduce_question: question.multipleChoice.introduceQuestion,
				time_limit: question.multipleChoice.defaultTimeLimit,
				points_awarded: question.multipleChoice.pointsAwarded,
				answers: [
					{ content: { Text: m.answer_true() }, correct: true, id: 0 },
					{ content: { Text: m.answer_false() }, correct: false, id: 1 }
				]
			},
			id
		})
	},
	{
		key: 'type-answer',
		group: 'test',
		icon: KeyboardOutline,
		label: m.short_answer,
		description: m.short_answer_desc,
		create: (id) => ({
			TypeAnswer: {
				title: '',
				introduce_question: question.typeAnswer.introduceQuestion,
				time_limit: question.typeAnswer.defaultTimeLimit,
				points_awarded: question.typeAnswer.pointsAwarded,
				case_sensitive: false,
				answers: []
			},
			id
		})
	},
	{
		key: 'slider',
		group: 'test',
		icon: Tune,
		label: m.slider,
		description: m.slider_desc,
		create: (id) => ({
			Slider: {
				title: '',
				introduce_question: question.slider.introduceQuestion,
				time_limit: question.slider.defaultTimeLimit,
				points_awarded: question.slider.pointsAwarded,
				range: { min: 0, max: 100, step: 1 },
				correct: 50,
				tolerance: 5
			},
			id
		})
	},
	{
		key: 'pin-answer',
		group: 'test',
		icon: LocationOnOutline,
		label: m.pin_answer,
		description: m.pin_answer_desc,
		create: (id) => ({
			Pin: {
				title: '',
				introduce_question: question.pin.introduceQuestion,
				time_limit: question.pin.defaultTimeLimit,
				points_awarded: question.pin.pointsAwarded,
				correct_area: {
					Ellipse: { center: { x: 0.5, y: 0.5 }, radius_x: 0.15, radius_y: 0.2 }
				}
			},
			id
		})
	},
	{
		key: 'puzzle',
		group: 'test',
		icon: SwapVert,
		label: m.puzzle,
		description: m.puzzle_desc,
		create: (id) => ({
			Order: {
				title: '',
				introduce_question: question.order.introduceQuestion,
				time_limit: question.order.defaultTimeLimit,
				points_awarded: question.order.pointsAwarded,
				axis_labels: { from: '', to: '' },
				answers: []
			},
			id
		})
	},

	// --- Collect opinions ---
	{
		key: 'poll',
		group: 'opinion',
		icon: PieChartOutline,
		label: m.poll,
		description: m.poll_desc,
		create: (id) => ({
			Poll: {
				title: '',
				introduce_question: question.poll.introduceQuestion,
				time_limit: question.poll.defaultTimeLimit,
				points_awarded: 0,
				answers: []
			},
			id
		})
	},
	{
		key: 'scale',
		group: 'opinion',
		icon: LinearScale,
		label: m.scale,
		description: m.scale_desc,
		create: (id) => ({
			Scale: {
				title: '',
				introduce_question: question.scale.introduceQuestion,
				time_limit: question.scale.defaultTimeLimit,
				points_awarded: 0,
				min: 1,
				max: question.scale.defaultAgreementMax,
				style: 'Agreement',
				labels: {}
			},
			id
		})
	},
	{
		key: 'nps',
		group: 'opinion',
		icon: SentimentSatisfiedOutline,
		label: m.nps_scale,
		description: m.nps_scale_desc,
		// NPS is a scale with a fixed 0-10 range and its own reporting.
		create: (id) => ({
			Scale: {
				title: '',
				introduce_question: question.scale.introduceQuestion,
				time_limit: question.scale.defaultTimeLimit,
				points_awarded: 0,
				min: question.scale.npsMin,
				max: question.scale.npsMax,
				style: 'Nps',
				labels: { low: m.nps_low(), high: m.nps_high() }
			},
			id
		})
	},
	{
		key: 'drop-pin',
		group: 'opinion',
		icon: PinDropOutline,
		label: m.drop_pin,
		description: m.drop_pin_desc,
		// The same board as a pin answer, minus the target: nothing is right.
		create: (id) => ({
			Pin: {
				title: '',
				introduce_question: question.pin.introduceQuestion,
				time_limit: question.pin.defaultTimeLimit,
				points_awarded: 0,
				correct_area: null
			},
			id
		})
	},
	{
		key: 'word-cloud',
		group: 'opinion',
		icon: CloudOutline,
		label: m.word_cloud,
		description: m.word_cloud_desc,
		create: (id) => ({
			FreeText: {
				title: '',
				introduce_question: question.freeText.introduceQuestion,
				time_limit: question.freeText.defaultTimeLimit,
				points_awarded: 0,
				mode: 'WordCloud',
				max_entries: question.freeText.wordCloudEntries,
				max_entry_length: question.freeText.wordCloudEntryLength
			},
			id
		})
	},
	{
		key: 'open-ended',
		group: 'opinion',
		icon: ChatBubbleOutline,
		label: m.open_ended,
		description: m.open_ended_desc,
		create: (id) => ({
			FreeText: {
				title: '',
				introduce_question: question.freeText.introduceQuestion,
				time_limit: question.freeText.defaultTimeLimit,
				points_awarded: 0,
				mode: 'OpenEnded',
				max_entries: question.freeText.openEndedEntries,
				max_entry_length: question.freeText.openEndedEntryLength
			},
			id
		})
	},
	{
		key: 'brainstorm',
		group: 'opinion',
		icon: LightbulbOutline,
		label: m.brainstorm,
		description: m.brainstorm_desc,
		create: (id) => ({
			Brainstorm: {
				title: '',
				introduce_question: question.brainstorm.introduceQuestion,
				idea_time_limit: question.brainstorm.defaultIdeaTimeLimit,
				vote_time_limit: question.brainstorm.defaultVoteTimeLimit,
				points_awarded: 0,
				max_ideas_per_player: question.brainstorm.maxIdeasPerPlayer,
				max_votes_per_player: question.brainstorm.maxVotesPerPlayer,
				max_idea_length: question.brainstorm.maxIdeaLength
			},
			id
		})
	},

	// --- Present info ---
	{
		key: 'info-slide',
		group: 'present',
		icon: ArticleOutline,
		label: m.info_slide,
		description: m.info_slide_desc,
		create: (id) => ({
			InfoSlide: {
				title: '',
				body: undefined,
				duration: question.infoSlide.defaultDuration
			},
			id
		})
	}
];

export const slideGroups: { group: SlideGroup; label: () => string }[] = [
	{ group: 'test', label: m.group_test_knowledge },
	{ group: 'opinion', label: m.group_collect_opinions },
	{ group: 'present', label: m.group_present_info }
];
