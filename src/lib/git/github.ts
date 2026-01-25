/**
 * GitHub API client implementation (stub for future use)
 * Will use GitHub REST API v3
 * API docs: https://docs.github.com/en/rest
 */

import { BaseGitClient } from './base';
import type { OAuthTokens, PROptions, PRResponse, BranchInfo, GitUser } from './types';

export class GitHubClient extends BaseGitClient {
	constructor(tokens: OAuthTokens, repoOwner: string, repoName: string) {
		super(tokens, repoOwner, repoName);
	}

	async getCurrentUser(): Promise<GitUser> {
		throw new Error('GitHub integration not yet implemented');
	}

	async createBranch(name: string, from?: string): Promise<BranchInfo> {
		throw new Error('GitHub integration not yet implemented');
	}

	async createPullRequest(options: PROptions): Promise<PRResponse> {
		throw new Error('GitHub integration not yet implemented');
	}

	async getFileContent(path: string, ref?: string): Promise<string | null> {
		throw new Error('GitHub integration not yet implemented');
	}

	async listFiles(path: string, ref?: string): Promise<string[]> {
		throw new Error('GitHub integration not yet implemented');
	}

	async createMultipleFiles(
		files: Array<{ path: string; content: string; encoding?: 'text' | 'base64' }>,
		branch: string,
		message: string
	): Promise<void> {
		throw new Error('GitHub integration not yet implemented');
	}

	async forkRepository(): Promise<string> {
		throw new Error('GitHub integration not yet implemented');
	}

	async getFileCommitInfo(
		path: string,
		ref?: string
	): Promise<{ sha: string; firstCommitDate: Date; lastCommitDate: Date }> {
		throw new Error('GitHub integration not yet implemented');
	}
}
