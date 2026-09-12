// must be a subset of https://gitlab.com/fuiz/game-backend/-/raw/main/game/logic/src/settings.rs
export const limits = {
	fuiz: {
		maxSlidesCount: 500,
		maxTitleLength: 500,
		maxPlayerCount: 1000,
		multipleChoice: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxAnswerCount: 8
		},
		typeAnswer: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 60000,
			maxAnswerCount: 16
		},
		order: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 60000,
			maxAnswerCount: 8,
			maxLabelLength: 250
		},
		slider: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxUnitLength: 20,
			// Mirrors the backend's `slider.max_steps`: enough stops for any
			// sensible question, few enough that a client can render the track.
			maxSteps: 10000
		},
		scale: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxLabelLength: 250,
			maxPointsCount: 11,
			// Agreement scales run 1..N; the NPS scale is fixed at 0..10.
			allowedAgreementMaximums: [3, 4, 5, 6, 7, 10],
			defaultAgreementMax: 5,
			npsMin: 0,
			npsMax: 10
		},
		poll: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxAnswerCount: 8
		},
		pin: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			pointsAwarded: 1000,
			allowedPointsAwarded: [0, 500, 1000, 2000],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 30000,
			maxPolygonPoints: 200
		},
		freeText: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultTimeLimit: 60000,
			maxEntriesPerPlayer: 5,
			maxEntryLength: 200,
			allowedEntryCounts: [1, 2, 3, 4, 5],
			wordCloudEntries: 3,
			wordCloudEntryLength: 40,
			openEndedEntries: 1,
			openEndedEntryLength: 200
		},
		brainstorm: {
			maxTitleLength: 500,
			introduceQuestion: 5000,
			allowedIntroduceQuestion: [0, 3000, 5000, 7000, 10000, 15000, null],
			allowedTimeLimits: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultIdeaTimeLimit: 120000,
			defaultVoteTimeLimit: 60000,
			maxIdeasPerPlayer: 3,
			maxVotesPerPlayer: 3,
			maxIdeaLength: 200,
			allowedIdeaCounts: [1, 2, 3],
			allowedVoteCounts: [1, 2, 3]
		},
		infoSlide: {
			maxTitleLength: 500,
			maxBodyLength: 2000,
			allowedDurations: [10000, 20000, 30000, 60000, 120000, 240000, null],
			defaultDuration: null
		},
		maxAnswerTextLength: 500,
		maxImageAltLength: 200
	}
} as const;
