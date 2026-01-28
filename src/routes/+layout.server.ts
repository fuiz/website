import type { LayoutServerLoad } from './$types';

export const load = (async ({ platform }) => {
	let showLibrary = false;

	// Check if DATABASE and BUCKET are configured
	if (platform?.env.DATABASE && platform?.env.BUCKET) {
		try {
			// Check if fuizzes table exists using PRAGMA
			const tableInfo = await platform.env.DATABASE.prepare('PRAGMA table_info(fuizzes)').all();
			showLibrary = tableInfo.results.length > 0;
		} catch {
			// Table doesn't exist or query failed
			showLibrary = false;
		}
	}

	return {
		showLibrary
	};
}) satisfies LayoutServerLoad;
