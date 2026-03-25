import { parse } from 'smol-toml';
import { describe, expect, it } from 'vitest';
import { stringifyToml } from '../src/lib';
import type { IdlessLocalReferenceFuizConfig, ReferencingOnlineFuiz } from '../src/lib/types';

function makeConfig(
	overrides: Partial<IdlessLocalReferenceFuizConfig> = {}
): IdlessLocalReferenceFuizConfig {
	return {
		title: 'Test Quiz',
		slides: [],
		...overrides
	};
}

const cases: [string, IdlessLocalReferenceFuizConfig | ReferencingOnlineFuiz, string][] = [
	['empty quiz', makeConfig(), 'title = "Test Quiz"\nslides = []\n'],
	[
		'MultipleChoice slide',
		makeConfig({
			slides: [
				{
					MultipleChoice: {
						title: 'What is 1+1?',
						points_awarded: 100,
						answers: [
							{ correct: true, content: { Text: '2' } },
							{ correct: false, content: { Text: '3' } }
						]
					}
				}
			]
		}),
		[
			'title = "Test Quiz"',
			'',
			'[[slides]]',
			'',
			'[slides.MultipleChoice]',
			'answers = [{ correct = true, content = { Text = "2" } }, { correct = false, content = { Text = "3" } }]',
			'title = "What is 1+1?"',
			'points_awarded = 100',
			''
		].join('\n')
	],
	[
		'TypeAnswer slide',
		makeConfig({
			slides: [
				{
					TypeAnswer: {
						title: 'Spell "cat"',
						points_awarded: 50,
						answers: ['cat'],
						case_sensitive: false
					}
				}
			]
		}),
		[
			'title = "Test Quiz"',
			'',
			'[[slides]]',
			'',
			'[slides.TypeAnswer]',
			'title = "Spell \\"cat\\""',
			'points_awarded = 50',
			'case_sensitive = false',
			'answers = ["cat"]',
			''
		].join('\n')
	],
	[
		'Order slide',
		makeConfig({
			slides: [
				{
					Order: {
						title: 'Order these',
						points_awarded: 75,
						axis_labels: { from: 'First', to: 'Last' },
						answers: ['A', 'B', 'C']
					}
				}
			]
		}),
		[
			'title = "Test Quiz"',
			'',
			'[[slides]]',
			'',
			'[slides.Order]',
			'title = "Order these"',
			'points_awarded = 75',
			'answers = ["A", "B", "C"]',
			'axis_labels = { from = "First", to = "Last" }',
			''
		].join('\n')
	],
	[
		'media as inline table',
		makeConfig({
			slides: [
				{
					MultipleChoice: {
						title: 'With image',
						points_awarded: 100,
						media: {
							Image: { Url: { url: 'photo.png', alt: 'a photo' } }
						},
						answers: []
					}
				}
			]
		}),
		[
			'title = "Test Quiz"',
			'',
			'[[slides]]',
			'',
			'[slides.MultipleChoice]',
			'title = "With image"',
			'points_awarded = 100',
			'answers = []',
			'media = { Image = { Url = { url = "photo.png", alt = "a photo" } } }',
			''
		].join('\n')
	],
	[
		'optional fields',
		makeConfig({
			slides: [
				{
					MultipleChoice: {
						title: 'Timed',
						points_awarded: 200,
						time_limit: 30,
						introduce_question: 5,
						answer_mode: 'MultipleAnswers',
						answers: []
					}
				}
			]
		}),
		[
			'title = "Test Quiz"',
			'',
			'[[slides]]',
			'',
			'[slides.MultipleChoice]',
			'title = "Timed"',
			'points_awarded = 200',
			'time_limit = 30',
			'introduce_question = 5',
			'answer_mode = "MultipleAnswers"',
			'answers = []',
			''
		].join('\n')
	],
	[
		'multiple slides',
		makeConfig({
			slides: [
				{
					MultipleChoice: {
						title: 'Q1',
						points_awarded: 10,
						answers: []
					}
				},
				{
					TypeAnswer: {
						title: 'Q2',
						points_awarded: 20,
						answers: ['ans'],
						case_sensitive: true
					}
				}
			]
		}),
		[
			'title = "Test Quiz"',
			'',
			'[[slides]]',
			'',
			'[slides.MultipleChoice]',
			'title = "Q1"',
			'points_awarded = 10',
			'answers = []',
			'',
			'[[slides]]',
			'',
			'[slides.TypeAnswer]',
			'title = "Q2"',
			'points_awarded = 20',
			'case_sensitive = true',
			'answers = ["ans"]',
			''
		].join('\n')
	],
	[
		'special characters in strings',
		makeConfig({ title: 'Quiz "with" special\nchars' }),
		'title = "Quiz \\"with\\" special\\nchars"\nslides = []\n'
	],
	[
		'ReferencingOnlineFuiz — minimal',
		{
			config: { title: 'Online', slides: [] },
			author: 'alice',
			language: 'en'
		},
		[
			'author = "alice"',
			'language = "en"',
			'',
			'[config]',
			'title = "Online"',
			'slides = []',
			''
		].join('\n')
	],
	[
		'ReferencingOnlineFuiz — with subjects, grades, keywords',
		{
			config: { title: 'Geography Quiz', slides: [] },
			author: 'bob',
			language: 'ar',
			subjects: ['Geography', 'History'],
			grades: ['Secondary-School'],
			keywords: ['maps', 'world']
		},
		[
			'author = "bob"',
			'language = "ar"',
			'subjects = ["Geography", "History"]',
			'grades = ["Secondary-School"]',
			'keywords = ["maps", "world"]',
			'',
			'[config]',
			'title = "Geography Quiz"',
			'slides = []',
			''
		].join('\n')
	],
	[
		'ReferencingOnlineFuiz — with slides and media',
		{
			config: {
				title: 'Full Online',
				slides: [
					{
						MultipleChoice: {
							title: 'Pick one',
							points_awarded: 50,
							media: { Image: { Url: { url: 'banner.webp', alt: 'banner' } } },
							answers: [
								{ correct: true, content: { Text: 'A' } },
								{ correct: false, content: { Text: 'B' } }
							]
						}
					},
					{
						Order: {
							title: 'Sort them',
							points_awarded: 75,
							axis_labels: { from: 'Smallest', to: 'Largest' },
							answers: ['1', '2', '3']
						}
					}
				]
			},
			author: 'carol',
			language: 'en'
		},
		[
			'author = "carol"',
			'language = "en"',
			'',
			'[config]',
			'title = "Full Online"',
			'',
			'[[config.slides]]',
			'',
			'[config.slides.MultipleChoice]',
			'answers = [{ correct = true, content = { Text = "A" } }, { correct = false, content = { Text = "B" } }]',
			'title = "Pick one"',
			'points_awarded = 50',
			'media = { Image = { Url = { url = "banner.webp", alt = "banner" } } }',
			'',
			'[[config.slides]]',
			'',
			'[config.slides.Order]',
			'title = "Sort them"',
			'points_awarded = 75',
			'answers = ["1", "2", "3"]',
			'axis_labels = { from = "Smallest", to = "Largest" }',
			''
		].join('\n')
	],
	[
		'ReferencingOnlineFuiz — empty optional arrays',
		{
			config: { title: 'Bare', slides: [] },
			author: 'dave',
			language: 'fr',
			subjects: [],
			grades: [],
			keywords: []
		},
		[
			'author = "dave"',
			'language = "fr"',
			'subjects = []',
			'grades = []',
			'keywords = []',
			'',
			'[config]',
			'title = "Bare"',
			'slides = []',
			''
		].join('\n')
	]
];

describe('stringifyToml', () => {
	it.each(cases)('%s — serializes correctly', (_, input, expected) => {
		expect(stringifyToml(input)).toBe(expected);
	});

	it.each(cases)('%s — roundtrips through smol-toml parse', (_, input) => {
		expect(parse(stringifyToml(input))).toEqual(input);
	});
});
