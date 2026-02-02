/**
 * Git provider factory
 * Creates appropriate Git client based on provider type
 */

import { env } from '$env/dynamic/private';
import type { GitProvider, OAuthTokens, OAuthConfig } from './types';
import { GitLabClient } from './gitlab';
import type { BaseGitClient } from './base';

/**
 * Get OAuth configuration for a Git provider
 */
export function getOAuthConfig(provider: GitProvider): OAuthConfig {
	switch (provider) {
		case 'gitlab':
			return {
				clientId: env.GITLAB_CLIENT_ID || '',
				clientSecret: env.GITLAB_CLIENT_SECRET || '',
				redirectUri: env.GITLAB_REDIRECT_URI || '',
				authUrl: 'https://gitlab.com/oauth/authorize',
				tokenUrl: 'https://gitlab.com/oauth/token',
				scopes: ['api', 'write_repository']
			};
		default:
			throw new Error(`Unsupported Git provider: ${provider}`);
	}
}

/**
 * Create a Git client instance
 */
export function createGitClient(
	provider: GitProvider,
	tokens: OAuthTokens,
	repoOwner?: string,
	repoName?: string
): BaseGitClient {
	const owner = repoOwner || env.GIT_REPO_OWNER || '';
	const name = repoName || env.GIT_REPO_NAME || '';

	if (!owner || !name) {
		throw new Error('Repository owner and name must be provided');
	}

	switch (provider) {
		case 'gitlab':
			return new GitLabClient(tokens, owner, name);
		default:
			throw new Error(`Unsupported Git provider: ${provider}`);
	}
}

/**
 * Get the default Git provider from environment
 */
export function getDefaultProvider(): GitProvider {
	const provider = env.GIT_PROVIDER as GitProvider;
	if (!provider || !['gitlab'].includes(provider)) {
		return 'gitlab'; // Default to GitLab
	}
	return provider;
}
