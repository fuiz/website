<script lang="ts">
	import { env } from '$env/dynamic/public';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import Anchor from '$lib/navigation/Anchor.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<svelte:head>
	<title>Terms of Service</title>
	<meta property="og:title" content="Terms of Service" />
	<meta name="description" content="Terms of Service for Fuiz" />
	<meta property="og:description" content="Terms of Service for Fuiz" />
	<link rel="canonical" href={localizeHref(`${env.PUBLIC_PLAY_URL}/terms`)} />
</svelte:head>

<TypicalPage>
	<article>
		<h1>Terms of Service</h1>
		<p class="updated">Last updated: April 6, 2026</p>

		<p>
			These Terms of Service ("Terms") govern your use of Fuiz (<Anchor href="https://fuiz.org"
				>fuiz.org</Anchor
			>), an open-source learning platform operated by
			<Anchor href="https://beyondexpiry.org/">Beyond Expiry</Anchor>. By accessing or using Fuiz,
			you agree to be bound by these Terms.
		</p>

		<h2>1. Description of Service</h2>
		<p>
			Fuiz is a free, open-source platform for creating and hosting live quizzes. The service
			includes a web application for creating quiz content, a real-time game server for hosting
			live sessions, a public quiz library, and supporting services such as image processing and
			optional cloud backup.
		</p>

		<h2>2. Eligibility</h2>
		<p>
			There are no age restrictions for participating in quizzes as a player. Features that require
			third-party authentication (publishing quizzes, Google Drive backup) are subject to the age
			requirements of those third-party services (GitLab, Google).
		</p>

		<h2>3. User Conduct</h2>
		<p>When using Fuiz, you agree not to:</p>
		<ul>
			<li>
				Submit content that is unlawful, defamatory, obscene, hateful, or otherwise
				objectionable.
			</li>
			<li>Use the platform to harass, abuse, or harm others.</li>
			<li>
				Attempt to disrupt, overload, or interfere with the operation of the service or its
				infrastructure.
			</li>
			<li>
				Use automated tools to scrape, crawl, or otherwise extract data from the service in a
				manner that degrades performance for other users.
			</li>
			<li>Impersonate any person or entity, or misrepresent your affiliation.</li>
		</ul>
		<p>
			Player nicknames are subject to automatic content filtering. Nicknames that violate these
			standards may be rejected.
		</p>

		<h2>4. User-Generated Content</h2>
		<p>
			You retain ownership of any quiz content you create. By publishing a quiz to the public
			library, you grant Fuiz a non-exclusive, worldwide, royalty-free license to host, display,
			and distribute that content through the platform. You may request removal of your published
			content at any time by contacting us.
		</p>
		<p>
			You are solely responsible for the content you create and publish. Content submitted to the
			public library is subject to review by moderators, who may remove content that violates these
			Terms or is otherwise inappropriate.
		</p>

		<h2>5. Third-Party Services</h2>
		<p>
			Certain features integrate with third-party services. Your use of these integrations is also
			subject to the respective third party's terms:
		</p>
		<ul>
			<li>
				<strong>GitLab</strong>: Used for authentication and publishing quizzes to the library.
				Subject to
				<Anchor href="https://about.gitlab.com/terms/">GitLab's Terms of Service</Anchor>.
			</li>
			<li>
				<strong>Google</strong>: Used for optional Google Drive backup. Subject to
				<Anchor href="https://policies.google.com/terms">Google's Terms of Service</Anchor>.
			</li>
			<li>
				<strong>Cloudflare</strong>: Infrastructure provider. Subject to
				<Anchor href="https://www.cloudflare.com/terms/">Cloudflare's Terms of Service</Anchor>.
			</li>
		</ul>

		<h2>6. Open Source</h2>
		<p>
			Fuiz is open-source software licensed under the
			<Anchor href="https://www.gnu.org/licenses/agpl-3.0.en.html"
				>GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)</Anchor
			>. The source code is available on
			<Anchor href="https://gitlab.com/fuiz">GitLab</Anchor>. These Terms govern your use of the
			hosted service at fuiz.org and do not limit the rights granted to you under the AGPL.
		</p>

		<h2>7. Self-Hosting</h2>
		<p>
			Fuiz may be self-hosted under the terms of the AGPL license. Self-hosted instances are
			operated independently, and Beyond Expiry is not responsible for the operation, data
			handling, or policies of any self-hosted instance.
		</p>

		<h2>8. Availability and Modifications</h2>
		<p>
			We strive to keep Fuiz available and functioning, but we do not guarantee uninterrupted or
			error-free operation. We reserve the right to modify, suspend, or discontinue any part of
			the service at any time without prior notice. We may also update these Terms from time to
			time, with changes posted on this page.
		</p>

		<h2>9. Disclaimer of Warranties</h2>
		<p>
			Fuiz is provided "as is" and "as available" without warranties of any kind, whether express
			or implied, including but not limited to implied warranties of merchantability, fitness for a
			particular purpose, and non-infringement. We do not warrant that the service will meet your
			requirements, be uninterrupted, secure, or error-free.
		</p>

		<h2>10. Limitation of Liability</h2>
		<p>
			To the fullest extent permitted by applicable law, Beyond Expiry and its contributors shall
			not be liable for any indirect, incidental, special, consequential, or punitive damages, or
			any loss of data, use, or profits, arising out of or related to your use of Fuiz, regardless
			of the theory of liability.
		</p>

		<h2>11. Termination</h2>
		<p>
			We reserve the right to restrict or terminate access to the service for any user who violates
			these Terms. Since Fuiz does not require accounts for most functionality, termination
			primarily applies to library publishing privileges and access to authenticated features.
		</p>

		<h2>12. Governing Law</h2>
		<p>
			These Terms shall be governed by and construed in accordance with applicable law, without
			regard to conflict of law principles.
		</p>

		<h2>13. Contact</h2>
		<p>
			If you have any questions about these Terms, contact us at
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
