import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, platform }) => {
	let showLibrary = false;

	// Check if database and BUCKET are configured
	if (locals.database && platform?.env?.BUCKET) {
		try {
			showLibrary = await locals.database.tableExists();
		} catch {
			showLibrary = false;
		}
	}

	// Check if publish functionality is fully configured
	const showPublish =
		// Platform bindings
		!!(
			locals.database &&
			platform?.env?.BUCKET &&
			platform?.env?.PUBLISH_JOBS &&
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
	const showShare = !!platform?.env?.MAP;

	return {
		showLibrary,
		showPublish,
		showShare
	};
}) satisfies LayoutServerLoad;
