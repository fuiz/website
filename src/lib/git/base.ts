/**
 * Base Git client abstract class
 * Provides a common interface for different Git providers (GitLab, GitHub, etc.)
 */

import type { BranchInfo, GitUser, OAuthTokens, PROptions, PRResponse } from './types';

export abstract class BaseGitClient {
	protected tokens: OAuthTokens;
	protected repoOwner: string;
	protected repoName: string;

	constructor(tokens: OAuthTokens, repoOwner: string, repoName: string) {
		this.tokens = tokens;
		this.repoOwner = repoOwner;
		this.repoName = repoName;
	}

	/**
	 * Get authenticated user information
	 */
	abstract getCurrentUser(): Promise<GitUser>;

	/**
	 * Create a new branch
	 * @param projectId Project identifier
	 * @param name Branch name
	 * @param from Source branch or commit (defaults to default branch)
	 */
	abstract createBranch(projectId: number, name: string, from?: string): Promise<BranchInfo>;

	/**
	 * Create a pull/merge request
	 * @param options PR options
	 */
	abstract createPullRequest(options: PROptions): Promise<PRResponse>;

	/**
	 * Get file content from repository
	 * @param path File path relative to repo root
	 * @param ref Branch, tag, or commit SHA (defaults to default branch)
	 * @returns File content or null if file not found (404)
	 */
	abstract getFileContent(path: string, ref?: string): Promise<Uint8Array<ArrayBuffer> | null>;

	/**
	 * Get commit information for a file (SHA, first commit date, last commit date)
	 * @param path File path relative to repo root
	 * @param ref Branch, tag, or commit SHA (defaults to default branch)
	 * @returns Object with commit SHA, first commit date (published_at), and last commit date (updated_at)
	 */
	abstract getFileCommitInfo(
		path: string,
		ref?: string
	): Promise<{ sha: string; firstCommitDate: Date; lastCommitDate: Date }>;

	/**
	 * List files in a directory
	 * @param path Directory path relative to repo root
	 * @param ref Branch, tag, or commit SHA (defaults to default branch)
	 * @returns Array of file paths
	 */
	abstract listDirectories(path: string, ref?: string): Promise<string[]>;

	/**
	 * Create multiple files in a single commit
	 * More efficient than creating files one by one
	 * @param projectId Project identifier
	 * @param files Array of files to create
	 * @param branch Branch name
	 * @param message Commit message
	 */
	abstract createMultipleFiles(
		projectId: number,
		files: Array<{ path: string; content: string; encoding?: 'text' | 'base64' }>,
		branch: string,
		message: string
	): Promise<void>;

	/**
	 * Fork the repository to the authenticated user's account
	 * Returns the forked project identifier
	 */
	abstract forkRepository(): Promise<{
		forkId: number;
		upstreamId: number;
	}>;
}
