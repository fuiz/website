import type { PageServerLoad } from './$types';

async function getStatistics(platform: Readonly<App.Platform> | undefined): Promise<{
	gamesPlayed: number | undefined;
	playersJoined: number | undefined;
}> {
	try {
		const allCounts = (await platform?.env.COUNTER.getAllCounts()) ?? {};
		return {
			gamesPlayed: allCounts.game_count,
			playersJoined: allCounts.player_count
		};
	} catch {
		return {
			gamesPlayed: undefined,
			playersJoined: undefined
		};
	}
}

export const load = (async ({ platform }) => {
	const { gamesPlayed, playersJoined } = await getStatistics(platform);

	return {
		gamesPlayed,
		playersJoined
	};
}) satisfies PageServerLoad;
