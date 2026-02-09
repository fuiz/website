/**
 * Git OAuth logout endpoint
 * Clears OAuth tokens from cookies
 */

import { json } from '@sveltejs/kit';
import { clearTokens, getAuthenticatedProvider } from '../gitUtil';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const provider = getAuthenticatedProvider(cookies);

	if (provider) {
		clearTokens(cookies, provider);
	}

	return json({
		success: true,
		message: 'Logged out successfully'
	});
};
