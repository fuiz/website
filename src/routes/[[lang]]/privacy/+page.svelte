<script lang="ts">
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
		<p class="updated">Last updated: May 25, 2026</p>

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
			over WebSocket connections. Game state (including the quiz content, nicknames, answers, and
			scores) is held in transient Cloudflare Durable Object storage for the duration of the
			session and is automatically deleted within one hour after the game ends. Short-lived game
			ID mappings used to route players to a session are retained for up to 24 hours after the
			game is created, after which they expire. We do not permanently store any player activity or
			game session data.
		</p>

		<h3>1.2 Quiz Content</h3>
		<p>
			Quizzes you create are stored locally in your browser using IndexedDB. We do not
			permanently store this data on our servers. Your quiz content is transmitted to our game
			server only when you start hosting a session (see Section 1.1), or when you choose to
			publish it to the public library or back it up to Google Drive.
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
			Publishing a quiz to the public library is performed through GitLab on your behalf: we fork
			the
			<Anchor href="https://gitlab.com/fuiz/library">public library repository</Anchor>
			into your GitLab account, commit the quiz to a branch under your account, and open a merge
			request to the upstream repository. Because the merge request is created using your GitLab
			account, your GitLab username and any information GitLab attaches to your commits (such as
			your public profile name and the commit email configured on your GitLab account) will be
			visible on the public repository.
		</p>
		<p>The submission includes:</p>
		<ul>
			<li>The quiz content (slide titles, answers, and any images you added).</li>
			<li>
				An author name you provide on the publish form. This field is pre-filled with your
				GitLab display name (or username) for convenience, but you can change it to any value
				before submitting.
			</li>
			<li>The metadata you select on the form: language, subjects, and grades.</li>
			<li>Keywords automatically generated from your slide titles (see Section 1.8).</li>
		</ul>
		<p>
			Once a submission is merged into the library, the quiz and its metadata are also synced into
			our database so that the website can list and serve it. The database additionally stores
			aggregate play and view counts per quiz.
		</p>

		<h3>1.7 Images</h3>
		<p>
			Images uploaded for use in quizzes are processed by our image service for format conversion
			and caching. Uploaded images are stored for up to 24 hours and are not associated with any
			user identity.
		</p>

		<h3>1.8 AI-Assisted Tagging</h3>
		<p>
			When you publish a quiz, we use an AI service (Cloudflare Workers AI on our hosted service,
			or an OpenAI-compatible API if configured on a self-hosted instance) to generate search
			keywords. Only the slide titles of the quiz are sent to the AI service for this purpose;
			answers, images, and author information are not sent. The resulting keywords are stored
			alongside the quiz in the public library.
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
			(Workers, Durable Objects, D1, R2, KV, and Workers AI). Cloudflare may process connection metadata
			(such as IP addresses) as part of delivering the service. Please refer to
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
				<strong>Game session data</strong>: Deleted automatically within one hour after the game
				ends; game ID lookup mappings expire within 24 hours of game creation.
			</li>
			<li>
				<strong>Uploaded images</strong>: Automatically deleted within 24 hours of upload.
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
