/**
 * Library sync script
 * Syncs fuizzes from Git repository to the database
 */

import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { parse } from '@ltd/j-toml';
import type { BaseGitClient } from '$lib/git/base';
import { createGitClient, getDefaultProvider } from '$lib/git/factory';
import type { OAuthTokens } from '$lib/git/types';
import { getThumbnail } from '$lib/serverOnlyUtils';
import type { FullOnlineFuiz, ReferencingOnlineFuiz } from '$lib/types';
import { fillMediaFromGit } from './imageHandler';

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
	viewCount: number = 0,
	publishedAt?: Date,
	updatedAt?: Date
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
		grades: fuizConfig.grades,
		keywords: fuizConfig.keywords
	};

	await bucket.put(fuizId, JSON.stringify(fullConfig), {
		httpMetadata: {
			contentType: 'application/json'
		}
	});

	// Prepare subjects, grades, and keywords as JSON arrays
	const subjectsJson =
		fuizConfig.subjects && fuizConfig.subjects.length > 0
			? JSON.stringify(fuizConfig.subjects)
			: null;
	const gradesJson =
		fuizConfig.grades && fuizConfig.grades.length > 0 ? JSON.stringify(fuizConfig.grades) : null;
	const keywordsJson =
		fuizConfig.keywords && fuizConfig.keywords.length > 0
			? JSON.stringify(fuizConfig.keywords)
			: null;

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
				keywords,
				slides_count,
				thumbnail,
				thumbnail_alt,
				git_commit_sha,
				played_count,
				view_count,
				published_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			fuizId,
			fuizId,
			processedConfig.title,
			fuizConfig.author,
			fuizConfig.language,
			subjectsJson,
			gradesJson,
			keywordsJson,
			processedConfig.slides.length,
			thumbnailData?.thumbnail || null,
			thumbnailData?.thumbnailAlt || null,
			commitSha || null,
			playedCount,
			viewCount,
			publishedAt?.toISOString() || new Date().toISOString(),
			updatedAt?.toISOString() || new Date().toISOString()
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
	lastCommitSha?: string,
	firstCommitDate?: Date,
	lastCommitDate?: Date
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
	const configContentBytes = await client.getFileContent(configPath, lastCommitSha);

	// If config not found, delete the fuiz
	if (!configContentBytes) {
		await deleteFuiz(fuizId, bucket, database);
		return;
	}

	// Check if this is an update to an existing fuiz
	const existing = await database
		.prepare('SELECT id, played_count, view_count, published_at FROM fuizzes WHERE id = ?')
		.bind(fuizId)
		.first<{ id: string; played_count: number; view_count: number; published_at: string }>();

	let playedCount = 0;
	let viewCount = 0;
	let publishedAt: Date;

	if (existing) {
		// This is an update - preserve statistics and original published date
		playedCount = existing.played_count;
		viewCount = existing.view_count;
		publishedAt = new Date(existing.published_at);

		// Delete old entry (we'll insert the new one)
		await database.prepare('DELETE FROM fuizzes WHERE id = ?').bind(fuizId).run();
	} else {
		// New fuiz - use firstCommitDate from GitLab event, or current date as fallback
		publishedAt = firstCommitDate || new Date();
	}

	// updated_at is the lastCommitDate from GitLab event, or current date as fallback
	const updatedAt = lastCommitDate || new Date();

	// Process and store the fuiz
	await processFuizConfig(
		fuizId,
		new TextDecoder().decode(configContentBytes),
		client,
		bucket,
		database,
		lastCommitSha,
		playedCount,
		viewCount,
		publishedAt,
		updatedAt
	);

	console.log(`Successfully synced fuiz ${fuizId}`);
}

/**
 * Sync all fuizzes from Git repository (manual full sync)
 */
export async function syncAll(
	bucket: R2Bucket,
	database: D1Database,
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
	const rootItems = await client.listDirectories('');

	for (const itemPath of rootItems) {
		const fuizId = itemPath;
		const configPath = `${fuizId}/config.toml`;

		try {
			// Check if config.toml exists
			const configContentBytes = await client.getFileContent(configPath);
			if (!configContentBytes) {
				// Not a fuiz directory, skip
				continue;
			}

			// Get commit info (SHA, first commit date, last commit date)
			const commitInfo = await client.getFileCommitInfo(configPath);

			// Check if already exists in fuizzes table with same commit
			const existing = await database
				.prepare(
					'SELECT git_commit_sha, played_count, view_count, published_at FROM fuizzes WHERE id = ?'
				)
				.bind(fuizId)
				.first<{
					git_commit_sha: string | null;
					played_count: number;
					view_count: number;
					published_at: string;
				}>();

			if (existing && existing.git_commit_sha === commitInfo.sha) {
				console.log(`Fuiz ${fuizId} already up to date (${commitInfo.sha}), skipping`);
				continue;
			}

			let playedCount = 0;
			let viewCount = 0;
			let publishedAt: Date;

			if (existing) {
				console.log(`Updating fuiz ${fuizId} (${existing.git_commit_sha} -> ${commitInfo.sha})`);
				// Preserve statistics and original published date
				playedCount = existing.played_count;
				viewCount = existing.view_count;
				publishedAt = new Date(existing.published_at);

				// Delete old entry (we'll insert the new one)
				await database.prepare('DELETE FROM fuizzes WHERE id = ?').bind(fuizId).run();
			} else {
				console.log(`Processing new fuiz: ${fuizId}`);
				// New fuiz - use first commit date as published date
				publishedAt = commitInfo.firstCommitDate;
			}

			// Process and store the fuiz
			await processFuizConfig(
				fuizId,
				new TextDecoder().decode(configContentBytes),
				client,
				bucket,
				database,
				commitInfo.sha,
				playedCount,
				viewCount,
				publishedAt,
				commitInfo.lastCommitDate
			);

			console.log(`Successfully synced fuiz: ${fuizId}`);
		} catch (err) {
			console.error(`Failed to sync fuiz ${fuizId}:`, err);
			// Continue with next fuiz
		}
	}

	console.log('Full sync complete');
}
