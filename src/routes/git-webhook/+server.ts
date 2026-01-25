/**
 * GitLab webhook handler
 * Processes push events to the default branch to sync modified fuizzes
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'crypto';
import { syncSingleFuiz } from '$lib/scripts/syncLibrary';

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
 * Extract fuiz directories from a list of file paths
 * Files like "abc-123/config.toml" or "abc-123/image.png" -> "abc-123"
 */
function extractFuizDirectories(filePaths: string[]): Set<string> {
	const directories = new Set<string>();

	for (const path of filePaths) {
		// Skip root-level files like README.md
		if (!path.includes('/')) continue;

		// Extract directory (first part before /)
		const directory = path.split('/')[0];

		// Only include if it looks like a UUID or valid fuiz directory
		if (directory && directory.length > 0) {
			directories.add(directory);
		}
	}

	return directories;
}

/**
 * Get commit info (SHA and timestamps) for a specific directory
 * from a list of commits (ordered chronologically)
 */
function getCommitInfoForDirectory(
	directory: string,
	commits: Array<{
		id: string;
		timestamp: string;
		added: string[];
		modified: string[];
		removed: string[];
	}>
): { lastCommitSha: string; firstCommitDate: Date; lastCommitDate: Date } | null {
	const prefix = `${directory}/`;
	let firstCommitDate: Date | null = null;
	let lastCommitDate: Date | null = null;
	let lastCommitSha: string | null = null;

	// Iterate through commits to find first and last that touched this directory
	for (let i = 0; i < commits.length; i++) {
		const commit = commits[i];
		const allFiles = [...commit.added, ...commit.modified, ...commit.removed];

		if (allFiles.some((file) => file.startsWith(prefix))) {
			const commitDate = new Date(commit.timestamp);

			// First time we see this directory, record as first commit
			if (firstCommitDate === null) {
				firstCommitDate = commitDate;
			}

			// Always update last commit (since we're iterating chronologically)
			lastCommitDate = commitDate;
			lastCommitSha = commit.id;
		}
	}

	if (lastCommitSha && firstCommitDate && lastCommitDate) {
		return { lastCommitSha, firstCommitDate, lastCommitDate };
	}
	return null;
}

/**
 * GitLab webhook payload types
 */
interface GitLabPushEvent {
	object_kind: 'push';
	ref: string; // e.g., 'refs/heads/main'
	after: string; // commit SHA
	commits: Array<{
		id: string;
		timestamp: string; // ISO 8601 timestamp
		added: string[];
		modified: string[];
		removed: string[];
	}>;
	project: {
		id: number;
		name: string;
		path_with_namespace: string;
	};
}

export const POST: RequestHandler = async ({ request, platform }) => {
	// Verify webhook secret
	const token = request.headers.get('X-Gitlab-Token');

	if (!token || !env.GIT_WEBHOOK_SECRET) {
		console.error('Missing webhook secret configuration');
		error(401, 'Unauthorized');
	}

	if (!timingSafeEqualString(token, env.GIT_WEBHOOK_SECRET)) {
		console.error('Invalid webhook secret');
		error(401, 'Unauthorized');
	}

	try {
		const payload = (await request.json()) as GitLabPushEvent;

		console.log('Received webhook event:', {
			kind: payload.object_kind,
			ref: payload.ref
		});

		// Only process push events
		if (payload.object_kind !== 'push') {
			return json({ message: 'Not a push event, ignoring' });
		}

		// Only process pushes to the default branch
		const defaultBranch = env.GIT_DEFAULT_BRANCH || 'main';
		const targetRef = `refs/heads/${defaultBranch}`;

		if (payload.ref !== targetRef) {
			return json({
				message: `Push to non-default branch (${payload.ref}), ignoring`
			});
		}

		// Collect all modified files from all commits
		const modifiedFiles: string[] = [];
		for (const commit of payload.commits) {
			modifiedFiles.push(...commit.added, ...commit.modified, ...commit.removed);
		}

		// Extract unique fuiz directories that were touched
		const fuizDirectories = extractFuizDirectories(modifiedFiles);

		if (fuizDirectories.size === 0) {
			return json({
				message: 'No fuiz directories were modified',
				modified_files: modifiedFiles
			});
		}

		console.log('Processing fuiz directories:', Array.from(fuizDirectories));

		// Sync each touched fuiz directory
		const results = [];
		for (const fuizId of fuizDirectories) {
			try {
				// Get commit info (SHA and timestamps) for this fuiz directory
				const commitInfo = getCommitInfoForDirectory(fuizId, payload.commits);

				if (!commitInfo) {
					throw new Error(`No commit info found for directory: ${fuizId}`);
				}

				await syncSingleFuiz(
					fuizId,
					platform?.env.BUCKET,
					platform?.env.DATABASE,
					commitInfo.lastCommitSha,
					commitInfo.firstCommitDate,
					commitInfo.lastCommitDate
				);

				console.log('Successfully synced fuiz:', fuizId);
				results.push({ fuizId, success: true });
			} catch (syncError) {
				console.error(`Failed to sync fuiz ${fuizId}:`, syncError);
				results.push({
					fuizId,
					success: false,
					error: String(syncError)
				});
			}
		}

		return json({
			success: true,
			message: `Processed ${fuizDirectories.size} fuiz(zes)`,
			results
		});
	} catch (err) {
		console.error('Webhook processing error:', err);

		// Return 200 to prevent retries
		return json({
			success: false,
			message: 'Webhook processing failed',
			error: String(err)
		});
	}
};
