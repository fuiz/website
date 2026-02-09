import { env } from '$env/dynamic/private';
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

	// Check if publish functionality is fully configured
	const showPublish =
		// Platform bindings
		!!(
			platform?.env.DATABASE &&
			platform?.env.BUCKET &&
			platform?.env.PUBLISH_JOBS &&
			// Git OAuth credentials
			env.GITLAB_CLIENT_ID &&
			env.GITLAB_CLIENT_SECRET &&
			env.GITLAB_REDIRECT_URI &&
			// Git repository configuration
			env.GIT_PROVIDER &&
			env.GIT_REPO_OWNER &&
			env.GIT_REPO_NAME &&
			env.GIT_DEFAULT_BRANCH
		);

	// Check if share functionality is configured (requires MAP KV namespace)
	const showShare = !!platform?.env.MAP;

	return {
		showLibrary,
		showPublish,
		showShare
	};
}) satisfies LayoutServerLoad;
