/**
 * Base Git client abstract class
 * Provides a common interface for different Git providers (GitLab, GitHub, etc.)
 */

import type { OAuthTokens, PROptions, PRResponse, BranchInfo, GitUser } from './types';

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
	 * @param name Branch name
	 * @param from Source branch or commit (defaults to default branch)
	 */
	abstract createBranch(name: string, from?: string): Promise<BranchInfo>;

	/**
	 * Create or update a file in the repository
	 * @param path File path relative to repo root
	 * @param content File content
	 * @param branch Branch name
	 * @param message Commit message
	 * @param encoding Content encoding ('text' or 'base64')
	 */
	abstract createOrUpdateFile(
		path: string,
		content: string,
		branch: string,
		message: string,
		encoding?: 'text' | 'base64'
	): Promise<void>;

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
	abstract getFileContent(path: string, ref?: string): Promise<string | null>;

	/**
	 * Get the last commit SHA where a file was modified
	 * @param path File path relative to repo root
	 * @param ref Branch, tag, or commit SHA (defaults to default branch)
	 * @returns Commit SHA
	 */
	abstract getFileLastCommit(path: string, ref?: string): Promise<string>;

	/**
	 * List files in a directory
	 * @param path Directory path relative to repo root
	 * @param ref Branch, tag, or commit SHA (defaults to default branch)
	 * @returns Array of file paths
	 */
	abstract listFiles(path: string, ref?: string): Promise<string[]>;

	/**
	 * List merged pull/merge requests
	 * @param since Optional date to filter PRs merged after this date
	 */
	abstract listMergedPRs(since?: Date): Promise<PRResponse[]>;

	/**
	 * Get pull/merge request details
	 * @param prNumber PR/MR number
	 */
	abstract getPullRequest(prNumber: number): Promise<PRResponse>;

	/**
	 * Delete a branch
	 * @param name Branch name
	 */
	abstract deleteBranch(name: string): Promise<void>;

	/**
	 * Check if a branch exists
	 * @param name Branch name
	 */
	abstract branchExists(name: string): Promise<boolean>;

	/**
	 * Create multiple files in a single commit
	 * More efficient than creating files one by one
	 * @param files Array of files to create
	 * @param branch Branch name
	 * @param message Commit message
	 */
	abstract createMultipleFiles(
		files: Array<{ path: string; content: string; encoding?: 'text' | 'base64' }>,
		branch: string,
		message: string
	): Promise<void>;

	/**
	 * Fork the repository to the authenticated user's account
	 * Returns the forked project path/identifier
	 */
	abstract forkRepository(): Promise<string>;
}
