import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const selfHosted = publicEnv.PUBLIC_SELF_HOSTED === 'true';
	let showLibrary = false;

	// Check if database and blob storage are configured
	if (locals.database && locals.blobStorage) {
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
			locals.blobStorage &&
			locals.publishJobsStore &&
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

	// Check if share functionality is configured
	const showShare = !!locals.shareStore;

	return {
		selfHosted,
		showLibrary,
		showPublish,
		showShare
	};
}) satisfies LayoutServerLoad;
