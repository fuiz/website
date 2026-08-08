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
 * of them would be noise. Absent — as on the component gallery — the topbar
 * falls back to the aggregate it was given.
 */
export type HostResponses = {
	/** Ask the server for the current slide's answers. */
	request: () => void;
	/** The reply, once it arrives. */
	readonly list: { name: string; answer: string }[] | undefined;
};
