import type { PageServerLoad } from './$types';
import { getGamesPlayed, getPlayersJoined } from './lib';

export const load = (async ({ platform }) => {
	const [gamesPlayed, playersJoined] = await Promise.all([
		getGamesPlayed(platform),
		getPlayersJoined(platform)
	]);

	return {
		gamesPlayed,
		playersJoined
	};
}) satisfies PageServerLoad;
