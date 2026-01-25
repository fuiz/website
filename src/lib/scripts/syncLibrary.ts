/**
 * Library sync script
 * Syncs fuizzes from Git repository to the database
 */

import { parse } from '@ltd/j-toml';
import type { FullOnlineFuiz, ReferencingOnlineFuiz } from '$lib/types';
import { createGitClient, getDefaultProvider } from '$lib/git/factory';
import type { OAuthTokens } from '$lib/git/types';
import type { BaseGitClient } from '$lib/git/base';
import { fillMediaFromGit } from './imageHandler';
import { getThumbnail } from '$lib/serverOnlyUtils';
import type { R2Bucket, D1Database } from '@cloudflare/workers-types';

/**
 * Delete a fuiz from database and R2 bucket
 */
async function deleteFuiz(fuizId: string, bucket?: R2Bucket, database?: D1Database): Promise<void> {
	console.log(`Deleting fuiz ${fuizId}`);

	// Delete from database
	try {
		await database?.prepare('DELETE FROM fuizzes WHERE id = ?').bind(fuizId).run();
	} catch (err) {
		console.error(`Failed to delete ${fuizId} from database:`, err);
	}

	// Delete from R2 bucket
	try {
		await bucket?.delete(fuizId);
	} catch (err) {
		console.error(`Failed to delete ${fuizId} from R2 bucket:`, err);
	}
}

/**
 * Process and store a fuiz config
 */
async function processFuizConfig(
	fuizId: string,
	configContent: string,
	client: BaseGitClient,
	bucket: R2Bucket,
	database: D1Database,
	commitSha?: string,
	playedCount: number = 0,
	viewCount: number = 0
): Promise<void> {
	// Parse TOML
	const fuizConfig = parse(configContent, { bigint: false }) as ReferencingOnlineFuiz;

	// Download images from Git and convert to Base64
	const processedConfig = await fillMediaFromGit(
		fuizConfig.config,
		client,
		fuizId,
		commitSha || 'main'
	);

	// Generate thumbnail
	const thumbnailData = await getThumbnail(processedConfig);

	// Store processed config in R2 bucket
	const fullConfig: FullOnlineFuiz = {
		config: processedConfig,
		author: fuizConfig.author,
		language: fuizConfig.language,
		subjects: fuizConfig.subjects,
		grades: fuizConfig.grades
	};

	await bucket.put(fuizId, JSON.stringify(fullConfig), {
		httpMetadata: {
			contentType: 'application/json'
		}
	});

	// Prepare subjects and grades as JSON arrays
	const subjectsJson =
		fuizConfig.subjects && fuizConfig.subjects.length > 0
			? JSON.stringify(fuizConfig.subjects)
			: null;
	const gradesJson =
		fuizConfig.grades && fuizConfig.grades.length > 0 ? JSON.stringify(fuizConfig.grades) : null;

	// Insert into fuizzes table
	await database
		.prepare(
			`INSERT INTO fuizzes (
				id,
				storage_id,
				title,
				author,
				language,
				subjects,
				grades,
				slides_count,
				thumbnail,
				thumbnail_alt,
				git_commit_sha,
				played_count,
				view_count,
				published_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		)
		.bind(
			fuizId,
			fuizId,
			processedConfig.title,
			fuizConfig.author,
			fuizConfig.language,
			subjectsJson,
			gradesJson,
			processedConfig.slides.length,
			thumbnailData?.thumbnail || null,
			thumbnailData?.thumbnailAlt || null,
			commitSha || null,
			playedCount,
			viewCount
		)
		.run();
}

/**
 * Sync a single fuiz from Git repository to database
 */
export async function syncSingleFuiz(
	storageId: string,
	bucket?: R2Bucket,
	database?: D1Database,
	commitSha?: string
): Promise<void> {
	if (!bucket || !database) {
		throw new Error('Bucket and database are required');
	}

	// Get Git client to read from repository
	const botToken = process.env.GIT_BOT_TOKEN;
	if (!botToken) {
		throw new Error('GIT_BOT_TOKEN is required for sync operations');
	}

	const provider = getDefaultProvider();
	const tokens: OAuthTokens = {
		access_token: botToken,
		token_type: 'Bearer'
	};

	const client = createGitClient(provider, tokens);

	// The storageId is the UUID from the branch name
	const fuizId = storageId;

	console.log(`Syncing fuiz ${fuizId} from Git`);

	// Get config.toml from Git repository
	const configPath = `${fuizId}/config.toml`;
	const configContent = await client.getFileContent(configPath, commitSha);

	// If config not found, delete the fuiz
	if (!configContent) {
		await deleteFuiz(fuizId, bucket, database);
		return;
	}

	// Check if this is an update to an existing fuiz
	const existing = await database
		.prepare('SELECT id, played_count, view_count FROM fuizzes WHERE id = ?')
		.bind(fuizId)
		.first<{ id: string; played_count: number; view_count: number }>();

	let playedCount = 0;
	let viewCount = 0;

	if (existing) {
		// This is an update - preserve statistics
		playedCount = existing.played_count;
		viewCount = existing.view_count;

		// Delete old entry (we'll insert the new one)
		await database.prepare('DELETE FROM fuizzes WHERE id = ?').bind(fuizId).run();
	}

	// Process and store the fuiz
	await processFuizConfig(
		fuizId,
		configContent,
		client,
		bucket,
		database,
		commitSha,
		playedCount,
		viewCount
	);

	console.log(`Successfully synced fuiz ${fuizId}`);
}

/**
 * Sync all fuizzes from Git repository (manual full sync)
 */
export async function syncAll(
	bucket?: R2Bucket,
	database?: D1Database,
	botToken?: string
): Promise<void> {
	if (!botToken) {
		throw new Error('GIT_BOT_TOKEN is required for full sync');
	}

	const provider = getDefaultProvider();
	const tokens: OAuthTokens = {
		access_token: botToken,
		token_type: 'Bearer'
	};

	const client = createGitClient(provider, tokens);

	console.log('Fetching all fuizzes from Git repository...');

	// Get all top-level items
	const rootItems = await client.listFiles('');

	for (const itemPath of rootItems) {
		const fuizId = itemPath;
		const configPath = `${fuizId}/config.toml`;

		try {
			// Check if config.toml exists
			const configContent = await client.getFileContent(configPath);
			if (!configContent) {
				// Not a fuiz directory, skip
				continue;
			}

			// Get the last commit SHA where this config.toml was modified
			const lastCommitSha = await client.getFileLastCommit(configPath);

			// Check if already exists in fuizzes table with same commit
			const existing = await database
				?.prepare('SELECT git_commit_sha FROM fuizzes WHERE id = ?')
				.bind(fuizId)
				.first<{ git_commit_sha: string | null }>();

			if (existing && existing.git_commit_sha === lastCommitSha) {
				console.log(`Fuiz ${fuizId} already up to date (${lastCommitSha}), skipping`);
				continue;
			}

			if (existing) {
				console.log(`Updating fuiz ${fuizId} (${existing.git_commit_sha} -> ${lastCommitSha})`);
			} else {
				console.log(`Processing new fuiz: ${fuizId}`);
			}

			// Process and store the fuiz
			await processFuizConfig(fuizId, configContent, client, bucket!, database!, lastCommitSha);

			console.log(`Successfully synced fuiz: ${fuizId}`);
		} catch (err) {
			console.error(`Failed to sync fuiz ${fuizId}:`, err);
			// Continue with next fuiz
		}
	}

	console.log('Full sync complete');
}

// CLI entry point for manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log('Running manual library sync...');

	const botToken = process.env.GIT_BOT_TOKEN;
	if (!botToken) {
		console.error('Error: GIT_BOT_TOKEN environment variable is required');
		process.exit(1);
	}

	// Note: When running as CLI, you'll need to provide bucket, database, and AI instances
	// This is a placeholder - actual implementation would need Cloudflare Workers context
	console.log('CLI mode not fully implemented - use API endpoint instead');
	console.log('Usage: POST /api/sync-library with admin authentication');
}
