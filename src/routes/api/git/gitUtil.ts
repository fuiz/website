/**
 * Git OAuth utilities
 * Provides helpers for OAuth authentication with Git providers (GitLab, GitHub)
 */

import { type Cookies, error } from '@sveltejs/kit';
import { getOAuthConfig } from '$lib/git/factory';
import type { GitProvider, OAuthTokens } from '$lib/git/types';

const COOKIE_PREFIX = 'git_tokens';

/**
 * Generate cryptographically secure random state for CSRF protection
 */
export function generateState(): string {
	const randomBytes = new Uint8Array(32);
	crypto.getRandomValues(randomBytes);
	return randomBytes.toBase64();
}

/**
 * Get the cookie name for a Git provider
 */
function getCookieName(provider: GitProvider): string {
	return `${COOKIE_PREFIX}_${provider}`;
}

/**
 * Build OAuth authorization URL
 */
export function getAuthUrl(provider: GitProvider, state: string): string {
	const config = getOAuthConfig(provider);

	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		response_type: 'code',
		scope: config.scopes.join(' '),
		state
	});

	return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(
	provider: GitProvider,
	code: string
): Promise<OAuthTokens> {
	const config = getOAuthConfig(provider);

	const body = new URLSearchParams({
		client_id: config.clientId,
		client_secret: config.clientSecret,
		code,
		grant_type: 'authorization_code',
		redirect_uri: config.redirectUri
	});

	const response = await fetch(config.tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json'
		},
		body: body.toString()
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Token exchange failed: ${errorText}`);
	}

	const data = await response.json();

	return {
		access_token: data.access_token,
		refresh_token: data.refresh_token,
		token_type: data.token_type || 'Bearer',
		expires_in: data.expires_in,
		created_at: data.created_at || Math.floor(Date.now() / 1000)
	};
}

/**
 * Store OAuth tokens in httpOnly cookie
 */
export function storeTokens(cookies: Cookies, provider: GitProvider, tokens: OAuthTokens): void {
	const cookieName = getCookieName(provider);
	console.log('[storeTokens] Storing tokens for provider:', provider, 'in cookie:', cookieName);

	cookies.set(cookieName, JSON.stringify(tokens), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax', // Changed from 'strict' to 'lax' to allow OAuth redirects
		maxAge: 60 * 60 * 24 * 365 // 1 year
	});
}

/**
 * Get OAuth tokens from cookie
 */
export function getTokens(cookies: Cookies, provider: GitProvider): OAuthTokens | null {
	const cookieName = getCookieName(provider);
	const tokenStr = cookies.get(cookieName);

	if (!tokenStr) {
		return null;
	}

	try {
		return JSON.parse(tokenStr) as OAuthTokens;
	} catch {
		return null;
	}
}

/**
 * Clear OAuth tokens from cookie
 */
export function clearTokens(cookies: Cookies, provider: GitProvider): void {
	const cookieName = getCookieName(provider);
	cookies.delete(cookieName, { path: '/' });
}

/**
 * Check if user is authenticated with a provider
 */
export function isAuthenticated(cookies: Cookies, provider: GitProvider): boolean {
	return getTokens(cookies, provider) !== null;
}

/**
 * Get tokens or throw error
 */
export function requireTokens(cookies: Cookies, provider: GitProvider): OAuthTokens {
	const tokens = getTokens(cookies, provider);

	if (!tokens) {
		error(401, `Not authenticated with ${provider}`);
	}

	return tokens;
}

/**
 * Detect which provider the user is authenticated with
 */
export function getAuthenticatedProvider(cookies: Cookies): GitProvider | null {
	if (isAuthenticated(cookies, 'gitlab')) {
		return 'gitlab';
	}
	return null;
}
