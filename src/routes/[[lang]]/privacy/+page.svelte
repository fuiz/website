<script>
	import { env } from '$env/dynamic/public';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import Anchor from '$lib/navigation/Anchor.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	const title = m.privacy_policy();
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content="Privacy Policy for Fuiz" />
	<meta property="og:description" content="Privacy Policy for Fuiz" />
	<link rel="canonical" href={localizeHref(`${env.PUBLIC_PLAY_URL}/privacy`)} />
</svelte:head>

<TypicalPage>
	<article>
		<h1>Privacy Policy</h1>
		<p class="updated">Last updated: April 6, 2026</p>

		<p>
			Fuiz (<Anchor href="https://fuiz.org">fuiz.org</Anchor>) is an open-source, privacy-focused
			learning platform operated by
			<Anchor href="https://beyondexpiry.org/">Beyond Expiry</Anchor>. This policy describes what
			data we collect, how we use it, and your rights regarding that data.
		</p>

		<h2>1. Data We Collect</h2>

		<h3>1.1 Game Sessions</h3>
		<p>
			When you host or play a quiz, we process player nicknames, answers, and scores in real time
			over WebSocket connections. This data is held in volatile memory and is automatically deleted
			when the game session ends. Game sessions expire no later than one hour after creation. We do
			not permanently store any player activity or game session data.
		</p>

		<h3>1.2 Quiz Content</h3>
		<p>
			Quizzes you create are stored locally in your browser using IndexedDB. This data never leaves
			your device unless you choose to publish it to the public library or back it up to Google
			Drive.
		</p>

		<h3>1.3 Authentication</h3>
		<p>
			If you choose to use optional features that require authentication, we process the following:
		</p>
		<ul>
			<li>
				<strong>GitLab OAuth</strong> (for publishing to the quiz library): We receive your GitLab
				username, display name, email address, and avatar URL. OAuth tokens are stored in
				HTTP-only, secure cookies on your browser with a one-year expiry.
			</li>
			<li>
				<strong>Google OAuth</strong> (for Google Drive backup): We receive an access token scoped
				to your Google Drive app data folder only. Tokens are stored in HTTP-only, secure cookies
				on your browser with a one-year expiry. We do not access any other Google account data.
			</li>
		</ul>
		<p>
			We do not create user accounts or maintain user profiles. Clearing your cookies or logging
			out removes all authentication data from your browser.
		</p>

		<h3>1.4 Cookies</h3>
		<p>We use cookies strictly for functionality. These include:</p>
		<ul>
			<li>
				<strong>Authentication cookies</strong>: Store OAuth tokens for GitLab and Google Drive
				integration (HTTP-only, secure, one-year expiry).
			</li>
			<li>
				<strong>Session cookies</strong>: Short-lived CSRF protection tokens for OAuth flows
				(ten-minute expiry).
			</li>
		</ul>
		<p>
			We do not use any advertising, analytics, or tracking cookies. We do not use any third-party
			tracking scripts.
		</p>

		<h3>1.5 Local Storage</h3>
		<p>
			We use your browser's local storage to save game session identifiers, allowing you to
			reconnect to an active game if your connection drops. This data is stored entirely on your
			device and is not transmitted to our servers.
		</p>

		<h3>1.6 Published Quizzes</h3>
		<p>
			If you publish a quiz to the public library, the quiz content, your GitLab username (as the
			author), and associated metadata (title, language, subjects, keywords) are stored in our
			database and made publicly available. Published quizzes include aggregate play and view
			counts.
		</p>

		<h3>1.7 Images</h3>
		<p>
			Images uploaded for use in quizzes are processed by our image service for format conversion
			and caching. Cached images are stored temporarily and are not associated with any user
			identity.
		</p>

		<h3>1.8 AI-Assisted Tagging</h3>
		<p>
			When quizzes are published, we may use AI services (Cloudflare Workers AI or an
			OpenAI-compatible API) to automatically suggest tags and keywords for the quiz content. Only
			the quiz content is sent to these services for this purpose.
		</p>

		<h2>2. Data We Do Not Collect</h2>
		<ul>
			<li>IP addresses</li>
			<li>Device fingerprints or identifiers</li>
			<li>Location or geolocation data</li>
			<li>Browsing history or behavior analytics</li>
			<li>Advertising identifiers</li>
			<li>Payment or financial information</li>
		</ul>

		<h2>3. Infrastructure</h2>
		<p>
			Fuiz is hosted on <Anchor href="https://www.cloudflare.com/">Cloudflare</Anchor> infrastructure
			(Workers, D1, R2, KV). Cloudflare may process connection metadata (such as IP addresses) as part
			of delivering the service. Please refer to
			<Anchor href="https://www.cloudflare.com/privacypolicy/">Cloudflare's Privacy Policy</Anchor>
			for details on their data handling practices.
		</p>
		<p>
			Self-hosted instances of Fuiz operate entirely on the host's own infrastructure and are not
			subject to this policy.
		</p>

		<h2>4. Data Retention</h2>
		<ul>
			<li>
				<strong>Game session data</strong>: Deleted automatically within one hour of game creation.
			</li>
			<li>
				<strong>Authentication tokens</strong>: Stored in browser cookies for up to one year, or
				until you log out or clear your cookies.
			</li>
			<li>
				<strong>Locally stored quizzes</strong>: Persist in your browser's IndexedDB until you
				delete them.
			</li>
			<li>
				<strong>Published quiz content</strong>: Retained in the public library indefinitely, or
				until removed by the author or a moderator.
			</li>
		</ul>

		<h2>5. Your Rights</h2>
		<p>You can at any time:</p>
		<ul>
			<li>Log out of GitLab or Google Drive to remove authentication cookies.</li>
			<li>Clear your browser's cookies and local storage to remove all client-side data.</li>
			<li>
				Request removal of a published quiz by contacting us at
				<Anchor href="mailto:info@fuiz.org">info@fuiz.org</Anchor>.
			</li>
		</ul>

		<h2>6. Children's Privacy</h2>
		<p>
			Fuiz does not knowingly collect personal information from children. Since we do not require
			accounts or collect identifying information during gameplay, children can participate in
			quizzes without providing personal data.
		</p>

		<h2>7. Changes to This Policy</h2>
		<p>
			We may update this policy from time to time. Changes will be posted on this page with an
			updated date. Continued use of Fuiz after changes constitutes acceptance of the revised
			policy.
		</p>

		<h2>8. Contact</h2>
		<p>
			If you have any questions about this privacy policy, contact us at
			<Anchor href="mailto:info@fuiz.org">info@fuiz.org</Anchor>.
		</p>
	</article>
</TypicalPage>

<style>
	article {
		max-width: 70ch;
		margin: 0 auto;
		padding: 0 1em;
		line-height: 1.6;
	}

	h1 {
		font-family: var(--alternative-font);
		margin-bottom: 0.25em;
	}

	h2 {
		margin-top: 1.5em;
		font-family: var(--alternative-font);
	}

	h3 {
		margin-top: 1em;
	}

	ul {
		padding-inline-start: 1.5em;
	}

	li {
		margin-bottom: 0.4em;
	}

	.updated {
		font-size: 0.85em;
		opacity: 0.7;
		margin-top: 0;
	}
</style>
