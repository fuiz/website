export type SharedGameInfo = {
	gameCode: string;
	questionIndex: number;
	questionTotalCount: number;
	// True while a host "Next" is in flight (the screen hasn't advanced yet),
	// used to disable the advance button against duplicate clicks.
	nextDisabled?: boolean;
};

export type BindableGameInfo = {
	volumeOn: boolean;
	locked: boolean;
};

/** What the topbar's responses control shows. */
export type ResponseSummary = {
	/** How many players have answered so far. */
	count: number;
};

/** Context key for the host's on-demand list of who answered what. */
export const HOST_RESPONSES = Symbol('host-responses');

/**
 * How the topbar asks for, and reads, the per-player answers.
 *
 * Passed by context rather than through props: the topbar sits under a dozen
 * screen components that have no interest in this, and threading it through all
 * of them would be noise. When absent, as on the component gallery, the topbar
 * falls back to the aggregate it was given.
 */
export type HostResponses = {
	/** Ask the server for the current slide's answers. */
	request: () => void;
	/** The reply, once it arrives. */
	readonly list: { name: string; answer: string }[] | undefined;
};

/** One team and who is on it, as the host's roster list shows it. */
export type TeamRoster = {
	/** The team's name, as the team display screen shows it. */
	name: string;
	/** Its members, in the order they were assigned to the team. */
	members: { name: string; connected: boolean }[];
};

/** Context key for the host's on-demand team rosters. */
export const HOST_TEAM_ROSTERS = Symbol('host-team-rosters');

/**
 * How a host screen asks for, and reads, the team rosters.
 *
 * By context for the same reason as {@link HostResponses}. Absent on the
 * component gallery, where the control simply does not appear.
 */
export type HostTeamRosters = {
	/** Ask the server who is on each team. */
	request: () => void;
	/** The reply, once it arrives. Undefined until the first one lands. */
	readonly list: TeamRoster[] | undefined;
	/** Whether this game plays in teams at all. */
	readonly enabled: boolean;
	/** Whether teams have been formed yet. */
	readonly formed: boolean;
};
