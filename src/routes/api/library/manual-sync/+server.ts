/**
 * Manual sync endpoint
 * Allows manually triggering a full sync of all fuizzes from Git repository
 * Protected by GIT_WEBHOOK_SECRET
 */

import { timingSafeEqual } from 'node:crypto';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { syncAll } from '$lib/scripts/syncLibrary';
import type { RequestHandler } from './$types';

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqualString(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	const encoder = new TextEncoder();
	const aEncoded = encoder.encode(a);
	const bEncoded = encoder.encode(b);

	if (aEncoded.byteLength !== bEncoded.byteLength) return false;

	return timingSafeEqual(aEncoded, bEncoded);
}

/**
 * POST /api/library/manual-sync
 *
 * Manually trigger a full sync of all fuizzes from Git repository.
 *
 * Authentication: Pass GIT_WEBHOOK_SECRET in Authorization header as Bearer token
 *
 * Example:
 * curl -X POST https://fuiz.org/api/library/manual-sync \
 *   -H "Authorization: Bearer YOUR_GIT_WEBHOOK_SECRET"
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	// Verify secret
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !env.GIT_WEBHOOK_SECRET) {
		console.error('Missing authorization or webhook secret configuration');
		error(401, 'Unauthorized');
	}

	const expectedAuth = `Bearer ${env.GIT_WEBHOOK_SECRET}`;

	if (!timingSafeEqualString(authHeader, expectedAuth)) {
		console.error('Invalid webhook secret');
		error(401, 'Unauthorized');
	}

	try {
		console.log('Manual full sync requested');

		if (!platform?.env.BUCKET || !platform?.env.DATABASE) {
			console.error('Missing R2 bucket or D1 database configuration');
			error(500, 'Server configuration error');
		}

		await syncAll(platform?.env.BUCKET, platform?.env.DATABASE, env.GIT_BOT_TOKEN);

		return json({
			success: true,
			message: 'Successfully synced all fuizzes'
		});
	} catch (err) {
		console.error('Manual sync error:', err);

		return json(
			{
				success: false,
				message: 'Sync failed',
				error: String(err)
			},
			{ status: 500 }
		);
	}
};
