/**
 * Client-side utilities for Google Drive authentication
 */

export interface GDriveAuthStatus {
	authenticated: boolean;
}

/**
 * Check if user is authenticated with Google Drive
 */
export async function checkGDriveAuth(): Promise<boolean> {
	try {
		const response = await fetch('/api/gdrive/status');
		if (!response.ok) return false;
		const status: GDriveAuthStatus = await response.json();
		return status.authenticated;
	} catch {
		return false;
	}
}

/**
 * Redirect to Google Drive login page
 */
export function loginWithGDrive(): void {
	const returnUrl = window.location.pathname;
	window.location.href = `/api/gdrive/login?return=${encodeURIComponent(returnUrl)}`;
}

/**
 * Logout from Google Drive
 */
export function logoutFromGDrive(): void {
	window.location.href = '/api/gdrive/logout';
}
