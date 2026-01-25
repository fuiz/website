/**
 * GitLab API client implementation
 * Uses GitLab REST API v4
 * API docs: https://docs.gitlab.com/ee/api/
 */

import { BaseGitClient } from './base';
import type { OAuthTokens, PROptions, PRResponse, BranchInfo, GitUser } from './types';

export class GitLabClient extends BaseGitClient {
	private apiBase = 'https://gitlab.com/api/v4';
	private projectPath: string;
	private forkedProjectPath?: string;
	private upstreamProjectId?: number;

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
			throw new Error(`GitLab API error: ${response.status} ${response.statusText} - ${error}`);
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

	async createBranch(name: string, from: string = 'main'): Promise<BranchInfo> {
		// Use forked project if available, otherwise use main project
		const targetProject = this.forkedProjectPath || this.projectPath;

		const response = await this.request<{
			name: string;
			commit: {
				id: string;
				message: string;
			};
		}>(`/projects/${targetProject}/repository/branches`, {
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

	async createOrUpdateFile(
		path: string,
		content: string,
		branch: string,
		message: string,
		encoding: 'text' | 'base64' = 'text'
	): Promise<void> {
		const encodedPath = encodeURIComponent(path);

		// Check if file exists
		let fileExists = false;
		try {
			await this.request(
				`/projects/${this.projectPath}/repository/files/${encodedPath}?ref=${branch}`
			);
			fileExists = true;
		} catch {
			// File doesn't exist, will create it
		}

		const body = {
			branch,
			commit_message: message,
			content: encoding === 'base64' ? content : content,
			encoding: encoding
		};

		const method = fileExists ? 'PUT' : 'POST';

		await this.request(`/projects/${this.projectPath}/repository/files/${encodedPath}`, {
			method,
			body: JSON.stringify(body)
		});
	}

	async createPullRequest(options: PROptions): Promise<PRResponse> {
		// If we have a fork, create MR from fork to upstream
		// Otherwise, create MR within the same project
		const body =
			this.forkedProjectPath && this.upstreamProjectId
				? {
						source_branch: options.sourceBranch,
						target_branch: options.targetBranch,
						target_project_id: this.upstreamProjectId,
						title: options.title,
						description: options.description
					}
				: {
						source_branch: options.sourceBranch,
						target_branch: options.targetBranch,
						title: options.title,
						description: options.description
					};

		// Create MR from forked project if it exists
		const targetProject = this.forkedProjectPath || this.projectPath;

		console.log('[GitLab] Creating merge request from:', targetProject);
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
		}>(`/projects/${targetProject}/merge_requests`, {
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

	async getFileContent(path: string, ref: string = 'main'): Promise<string | null> {
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

		return response.text();
	}

	async getFileLastCommit(path: string, ref: string = 'main'): Promise<string> {
		const encodedPath = encodeURIComponent(path);
		const response = await this.request<{
			last_commit_id: string;
		}>(`/projects/${this.projectPath}/repository/files/${encodedPath}?ref=${ref}`);

		return response.last_commit_id;
	}

	async listFiles(path: string, ref: string = 'main'): Promise<string[]> {
		const response = await this.request<
			Array<{
				name: string;
				path: string;
				type: string;
			}>
		>(`/projects/${this.projectPath}/repository/tree?path=${encodeURIComponent(path)}&ref=${ref}`);

		const files = response.filter((item) => item.type === 'blob');

		return files.map((file) => file.path);
	}

	async listMergedPRs(since?: Date): Promise<PRResponse[]> {
		let endpoint = `/projects/${this.projectPath}/merge_requests?state=merged&order_by=updated_at&sort=desc`;

		if (since) {
			endpoint += `&updated_after=${since.toISOString()}`;
		}

		const response = await this.request<
			Array<{
				id: number;
				iid: number;
				web_url: string;
				state: string;
				source_branch: string;
				target_branch: string;
				title: string;
				merged_at?: string;
				merge_commit_sha?: string;
			}>
		>(endpoint);

		return response.map((mr) => ({
			id: mr.id,
			iid: mr.iid,
			url: mr.web_url,
			state: mr.state as 'opened' | 'merged' | 'closed',
			source_branch: mr.source_branch,
			target_branch: mr.target_branch,
			title: mr.title,
			merged_at: mr.merged_at,
			merge_commit_sha: mr.merge_commit_sha
		}));
	}

	async getPullRequest(prNumber: number): Promise<PRResponse> {
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
		}>(`/projects/${this.projectPath}/merge_requests/${prNumber}`);

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

	async deleteBranch(name: string): Promise<void> {
		const encodedBranch = encodeURIComponent(name);
		await this.request(`/projects/${this.projectPath}/repository/branches/${encodedBranch}`, {
			method: 'DELETE'
		});
	}

	async branchExists(name: string): Promise<boolean> {
		try {
			const encodedBranch = encodeURIComponent(name);
			await this.request(`/projects/${this.projectPath}/repository/branches/${encodedBranch}`);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Create multiple files in a single commit using GitLab Commits API
	 * More efficient than creating files one by one
	 */
	async createMultipleFiles(
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

		// Use forked project if available, otherwise use main project
		const targetProject = this.forkedProjectPath || this.projectPath;

		await this.request(`/projects/${targetProject}/repository/commits`, {
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
	 * Returns the forked project path
	 */
	async forkRepository(): Promise<string> {
		try {
			// Get upstream project ID
			const upstreamProject = await this.request<{ id: number }>(`/projects/${this.projectPath}`);
			this.upstreamProjectId = upstreamProject.id;

			// Check if fork already exists
			const user = await this.getCurrentUser();
			const potentialForkPath = encodeURIComponent(`${user.username}/${this.repoName}`);

			try {
				await this.request(`/projects/${potentialForkPath}`);
				// Fork exists, use it
				this.forkedProjectPath = potentialForkPath;
				console.log('[GitLab] Using existing fork:', potentialForkPath);
				return potentialForkPath;
			} catch {
				// Fork doesn't exist, create it
			}

			// Create fork
			console.log('[GitLab] Creating fork...');
			const response = await this.request<{
				id: number;
				path_with_namespace: string;
			}>(`/projects/${this.projectPath}/fork`, {
				method: 'POST',
				body: JSON.stringify({})
			});

			this.forkedProjectPath = encodeURIComponent(response.path_with_namespace);

			// Wait for fork to complete (GitLab forks asynchronously)
			console.log('[GitLab] Waiting for fork to complete...');
			await this.waitForFork(this.forkedProjectPath);
			console.log('[GitLab] Fork ready:', this.forkedProjectPath);

			return this.forkedProjectPath;
		} catch (error) {
			console.error('Fork creation failed:', error);
			throw new Error('Failed to fork repository');
		}
	}

	/**
	 * Wait for fork to complete (GitLab forks are created asynchronously)
	 */
	private async waitForFork(forkPath: string, maxAttempts: number = 30): Promise<void> {
		for (let i = 0; i < maxAttempts; i++) {
			try {
				const project = await this.request<{ import_status: string }>(`/projects/${forkPath}`);

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
