/**
 * Git provider types and interfaces
 */

export type GitProvider = 'gitlab';

export interface OAuthTokens {
	access_token: string;
	refresh_token?: string;
	token_type: string;
	expires_in?: number;
	created_at?: number;
}

export interface OAuthConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	authUrl: string;
	tokenUrl: string;
	scopes: string[];
}

export interface GitUser {
	id: number;
	username: string;
	name: string;
	email?: string;
	avatar_url?: string;
}

export interface PROptions {
	sourceProjectId: number;
	sourceBranch: string;
	targetProjectId: number;
	targetBranch: string;
	title: string;
	description: string;
}

export interface PRResponse {
	id: number;
	iid: number;
	url: string;
	state: 'opened' | 'merged' | 'closed';
	source_branch: string;
	target_branch: string;
	title: string;
	merged_at?: string;
	merge_commit_sha?: string;
}

export interface BranchInfo {
	name: string;
	commit: {
		sha: string;
		message: string;
	};
}

export interface CommitInfo {
	sha: string;
	message: string;
	author: {
		name: string;
		email: string;
		date: string;
	};
}
