export type SharedGameInfo = {
	gameCode: string;
	questionIndex: number;
	questionTotalCount: number;
};

export type BindableGameInfo = {
	volumeOn: boolean;
	locked: boolean;
};

export type TruncatedList<T> = {
	exact_count: number;
	items: T[];
};
