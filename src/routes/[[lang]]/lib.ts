export async function getCounterValue(
	platform: Readonly<App.Platform> | undefined,
	name: string
): Promise<number | undefined> {
	try {
		return platform?.env.COUNTER.getCount(name) ?? undefined;
	} catch {
		return undefined;
	}
}

export async function getGamesPlayed(
	platform: Readonly<App.Platform> | undefined
): Promise<number | undefined> {
	return getCounterValue(platform, 'game_count');
}

export async function getPlayersJoined(
	platform: Readonly<App.Platform> | undefined
): Promise<number | undefined> {
	return getCounterValue(platform, 'player_count');
}
