/**
 * GitLab API client implementation
 * Uses GitLab REST API v4
 * API docs: https://docs.gitlab.com/ee/api/
 */

import { BaseGitClient } from './base';
import type { BranchInfo, GitUser, OAuthTokens, PROptions, PRResponse } from './types';

export class GitLabClient extends BaseGitClient {
	private apiBase = 'https://gitlab.com/api/v4';
	private projectPath: string;

	constructor(tokens: OAuthTokens, repoOwner: string, repoName: string) {
		super(tokens, repoOwner, repoName);
		this.projectPath = encodeURIComponent(`${repoOwner}/${repoName}`);
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.apiBase}${endpoint}`;
		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.tokens.access_token}`,
				'Content-Type': 'application/json',
				...options.headers
			}
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`GitLab API error: ${response.status} ${response.statusText} - ${error}`, {
				cause: { status: response.status, statusText: response.statusText, response: error }
			});
		}

		return response.json() as Promise<T>;
	}

	async getCurrentUser(): Promise<GitUser> {
		const user = await this.request<{
			id: number;
			username: string;
			name: string;
			email?: string;
			avatar_url?: string;
		}>('/user');

		return {
			id: user.id,
			username: user.username,
			name: user.name,
			email: user.email,
			avatar_url: user.avatar_url
		};
	}

	async createBranch(projectId: number, name: string, from: string = 'main'): Promise<BranchInfo> {
		const response = await this.request<{
			name: string;
			commit: {
				id: string;
				message: string;
			};
		}>(`/projects/${projectId}/repository/branches`, {
			method: 'POST',
			body: JSON.stringify({
				branch: name,
				ref: from
			})
		});

		return {
			name: response.name,
			commit: {
				sha: response.commit.id,
				message: response.commit.message
			}
		};
	}

	async createPullRequest(options: PROptions): Promise<PRResponse> {
		const body = {
			source_branch: options.sourceBranch,
			target_branch: options.targetBranch,
			target_project_id: options.targetProjectId,
			title: options.title,
			description: options.description
		};

		console.log('[GitLab] Creating merge request from:', options.sourceProjectId);
		const response = await this.request<{
			id: number;
			iid: number;
			web_url: string;
			state: string;
			source_branch: string;
			target_branch: string;
			title: string;
			merged_at?: string;
			merge_commit_sha?: string;
		}>(`/projects/${options.sourceProjectId}/merge_requests`, {
			method: 'POST',
			body: JSON.stringify(body)
		});

		console.log('[GitLab] Merge request created:', response.web_url);

		return {
			id: response.id,
			iid: response.iid,
			url: response.web_url,
			state: response.state as 'opened' | 'merged' | 'closed',
			source_branch: response.source_branch,
			target_branch: response.target_branch,
			title: response.title,
			merged_at: response.merged_at,
			merge_commit_sha: response.merge_commit_sha
		};
	}

	async getFileContent(
		path: string,
		ref: string = 'main'
	): Promise<Uint8Array<ArrayBuffer> | null> {
		const encodedPath = encodeURIComponent(path);
		const response = await fetch(
			`${this.apiBase}/projects/${this.projectPath}/repository/files/${encodedPath}/raw?ref=${ref}`,
			{
				headers: {
					Authorization: `Bearer ${this.tokens.access_token}`
				}
			}
		);

		if (!response.ok) {
			// Return null on 404, throw on other errors
			if (response.status === 404) {
				return null;
			}
			throw new Error(`Failed to get file content: ${response.status} ${response.statusText}`);
		}

		return await response.bytes();
	}

	async getFileCommitInfo(
		path: string,
		ref: string = 'main'
	): Promise<{ sha: string; firstCommitDate: Date; lastCommitDate: Date }> {
		// Get all commits for this file
		const commits = await this.request<
			Array<{
				id: string;
				committed_date: string;
			}>
		>(
			`/projects/${this.projectPath}/repository/commits?path=${encodeURIComponent(path)}&ref_name=${ref}`
		);

		if (commits.length === 0) {
			throw new Error(`No commits found for file: ${path}`);
		}

		// First commit in response is the most recent (last commit)
		const lastCommit = commits[0];
		// Last commit in response is the oldest (first commit)
		const firstCommit = commits[commits.length - 1];

		return {
			sha: lastCommit.id,
			firstCommitDate: new Date(firstCommit.committed_date),
			lastCommitDate: new Date(lastCommit.committed_date)
		};
	}

	async listDirectories(path: string, ref: string = 'main'): Promise<string[]> {
		const response = await this.request<
			Array<{
				name: string;
				path: string;
				type: string;
			}>
		>(`/projects/${this.projectPath}/repository/tree?path=${encodeURIComponent(path)}&ref=${ref}`);

		const directories = response.filter((item) => item.type === 'tree');

		return directories.map((directory) => directory.path);
	}

	/**
	 * Create multiple files in a single commit using GitLab Commits API
	 * More efficient than creating files one by one
	 */
	async createMultipleFiles(
		projectId: number,
		files: Array<{ path: string; content: string; encoding?: 'text' | 'base64' }>,
		branch: string,
		message: string
	): Promise<void> {
		const actions = files.map((file) => ({
			action: 'create',
			file_path: file.path,
			content: file.content,
			encoding: file.encoding || 'text'
		}));

		await this.request(`/projects/${projectId}/repository/commits`, {
			method: 'POST',
			body: JSON.stringify({
				branch,
				commit_message: message,
				actions
			})
		});
	}

	/**
	 * Fork the repository to the authenticated user's account
	 * Returns the forked project identifier
	 */
	async forkRepository(): Promise<{
		forkId: number;
		upstreamId: number;
	}> {
		const upstreamProject = await this.request<{
			id: number;
		}>(`/projects/${this.projectPath}`);

		const upstreamId = upstreamProject.id;

		// Check if fork already exists with Owner access
		// List all forks where user has Owner access (min_access_level=50)
		// https://docs.gitlab.com/api/project_forks/
		console.log('[GitLab] Checking for existing forks with owner access...');
		const forks = await this.request<
			Array<{
				id: number;
				import_status?: string;
			}>
		>(`/projects/${upstreamId}/forks?min_access_level=50`);

		// If any fork with owner access exists, use the first one
		if (forks.length > 0) {
			const fork = forks[0];
			console.log('[GitLab] Using existing fork with owner access:', fork.id);

			// Ensure fork is ready
			if (
				fork.import_status &&
				fork.import_status !== 'finished' &&
				fork.import_status !== 'none'
			) {
				console.log('[GitLab] Waiting for fork to complete...');
				await this.waitForFork(fork.id);
			}

			return {
				forkId: fork.id,
				upstreamId
			};
		}

		// No fork with owner access exists, try to create one
		console.log('[GitLab] No fork with owner access found, creating new fork...');
		const response = await this.request<{
			id: number;
		}>(`/projects/${upstreamId}/fork`, {
			method: 'POST',
			body: JSON.stringify({})
		});

		const forkId = response.id;

		// Wait for fork to complete (GitLab forks asynchronously)
		console.log('[GitLab] Waiting for fork to complete...');
		await this.waitForFork(forkId);
		console.log('[GitLab] Fork ready:', forkId);

		return {
			forkId,
			upstreamId
		};
	}

	/**
	 * Wait for fork to complete (GitLab forks are created asynchronously)
	 */
	private async waitForFork(forkId: number, maxAttempts: number = 30): Promise<void> {
		for (let i = 0; i < maxAttempts; i++) {
			try {
				const project = await this.request<{ import_status: string }>(`/projects/${forkId}`);

				if (project.import_status === 'finished' || project.import_status === 'none') {
					return;
				}

				// Wait 2 seconds before checking again
				await new Promise((resolve) => setTimeout(resolve, 2000));
			} catch {
				// Project might not be ready yet, wait and retry
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}

		throw new Error('Fork creation timed out');
	}
}
