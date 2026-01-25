/**
 * Streaming publish endpoint
 * Sends progress updates as Server-Sent Events
 */

import { getAuthenticatedProvider, getTokens } from '../git/gitUtil';
import { createGitClient } from '$lib/git/factory';
import {
	mapIdlessMedia,
	type FullOnlineFuiz,
	type ReferencingOnlineFuiz,
	type IdlessFullFuizConfig
} from '$lib/types';
import { tomlifyConfig, stringifyToml, assertUnreachable } from '$lib';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { processMedia } from './imageProcessor';
import { json } from '@sveltejs/kit';
import type { Ai } from '@cloudflare/workers-types';

interface ImageFile {
	path: string;
	content: string;
	encoding: 'base64';
	hash: string;
	extension: string;
}

async function extractKeywords(ai: Ai, config: IdlessFullFuizConfig): Promise<string[]> {
	const messages: { role: 'system' | 'user'; content: string }[] = [
		{
			role: 'system',
			content:
				'Give sixteen keywords of the following user content to aid users find it while searching, separated with commas and no other system text ever'
		},
		{
			role: 'user',
			content: config.slides
				.map((slide) => {
					switch (true) {
						case 'TypeAnswer' in slide:
							return slide.TypeAnswer.title;
						case 'Order' in slide:
							return slide.Order.title;
						case 'MultipleChoice' in slide:
							return slide.MultipleChoice.title;
						default:
							return assertUnreachable(slide);
					}
				})
				.join('\n')
		}
	];

	const response = await ai.run('@cf/openai/gpt-oss-20b', { messages, stream: false });

	return response.output_text?.split(',')?.slice(0, 16) ?? [];
}

export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	// Check Git authentication
	const provider = getAuthenticatedProvider(cookies);
	if (!provider) {
		return json({ error: 'git_auth_required' }, { status: 401 });
	}

	const tokens = getTokens(cookies, provider);
	if (!tokens) {
		return json({ error: 'git_auth_required' }, { status: 401 });
	}

	// Get job ID from query params
	const jobId = url.searchParams.get('job');
	if (!jobId) {
		return json({ error: 'missing_job_id' }, { status: 400 });
	}

	// Retrieve job data from KV
	const fuizConfig = await platform?.env.PUBLISH_JOBS.get<FullOnlineFuiz>(jobId, 'json');
	if (!fuizConfig) {
		return json({ error: 'job_not_found' }, { status: 404 });
	}

	// Clean up job data
	await platform?.env.PUBLISH_JOBS.delete(jobId);

	const fuizId = crypto.randomUUID();

	// Create a readable stream for SSE
	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const send = (event: string, data: Record<string, unknown>) => {
				controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
			};

			try {
				// Fork repository
				send('progress', { state: 'forking', message: 'Forking repository...' });
				const client = createGitClient(provider, tokens);
				await client.forkRepository();

				// Create branch and upload
				send('progress', { state: 'creating-branch', message: 'Creating branch...' });

				// Extract images and process config
				const imageFiles = new Map<string, ImageFile>();

				// Process slides to extract images
				const processedSlides = await Promise.all(
					fuizConfig.config.slides.map((slide) =>
						mapIdlessMedia(slide, (media) => processMedia(media, imageFiles, fuizId))
					)
				);

				// Generate keywords using Cloudflare AI
				send('progress', { state: 'generating-keywords', message: 'Generating keywords...' });
				const keywords = platform?.env.AI
					? await extractKeywords(platform.env.AI, fuizConfig.config)
					: [];

				const processedConfig: ReferencingOnlineFuiz = {
					...fuizConfig,
					keywords,
					config: {
						...fuizConfig.config,
						slides: processedSlides
					}
				};

				const tomlConfig: ReferencingOnlineFuiz = {
					author: processedConfig.author,
					language: processedConfig.language,
					...(processedConfig.subjects &&
						processedConfig.subjects.length > 0 && { subjects: processedConfig.subjects }),
					...(processedConfig.grades &&
						processedConfig.grades.length > 0 && { grades: processedConfig.grades }),
					...(keywords && keywords.length > 0 && { keywords }),
					config: tomlifyConfig(processedConfig.config)
				};

				// Convert to TOML
				const tomlContent = stringifyToml(tomlConfig);

				// Create branch
				const branchName = `submission/${fuizId}`;
				const defaultBranch = env.GIT_DEFAULT_BRANCH || 'main';

				await client.createBranch(branchName, defaultBranch);

				// Upload files
				send('progress', { state: 'uploading', message: 'Uploading files...' });

				const tomlPath = `${fuizId}/config.toml`;
				const filesToUpload = [
					{
						path: tomlPath,
						content: tomlContent,
						encoding: 'text' as const
					},
					...Array.from(imageFiles.values()).map((imageFile) => ({
						path: imageFile.path,
						content: imageFile.content,
						encoding: 'base64' as const
					}))
				];

				await client.createMultipleFiles(
					filesToUpload,
					branchName,
					`Add fuiz: ${fuizConfig.config.title} (${filesToUpload.length} files)`
				);

				// Create PR
				send('progress', { state: 'creating-pr', message: 'Creating pull request...' });

				const prBody = `## Fuiz Submission

**Title:** ${fuizConfig.config.title}

**Author:** ${fuizConfig.author}

**Language:** ${fuizConfig.language}

**Subjects:** ${fuizConfig.subjects?.join(', ') || 'None'}

**Grades:** ${fuizConfig.grades?.join(', ') || 'None'}

### Details
- **Slides:** ${fuizConfig.config.slides.length}
- **Fuiz ID:** ${fuizId}
- **Images:** ${imageFiles.size} file(s)

---
*This PR was automatically created by the Fuiz publishing system.*
*Merge this PR to publish the fuiz to the public library.*`;

				const pr = await client.createPullRequest({
					sourceBranch: branchName,
					targetBranch: defaultBranch,
					title: `[Submission] ${fuizConfig.config.title}`,
					description: prBody
				});

				// Send success
				send('complete', { r2_key: fuizId, pr_url: pr.url });
			} catch (err) {
				console.error('Failed to publish:', err);
				send('error', { message: String(err) });
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
