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

export type TruncatedList<T> = {
	exact_count: number;
	items: T[];
};
