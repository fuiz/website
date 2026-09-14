<script lang="ts">
	import { env } from '$env/dynamic/public';
	import barish from '$lib/assets/people/Barish.webp';
	import khaleel from '$lib/assets/people/Khaleel.webp';
	import sebastian from '$lib/assets/people/Sebastian.webp';
	import yichen from '$lib/assets/people/Yichen.webp';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Card from '$lib/ui/Card.svelte';
	import AlbumOutline from '~icons/material-symbols/album-outline';
	import BrushOutline from '~icons/material-symbols/brush-outline';
	import ComputerOutline from '~icons/material-symbols/computer-outline';
	import Language from '~icons/material-symbols/language';
	import MailOutline from '~icons/material-symbols/mail-outline';

	const title = m.credits_title();
	const description = m.credits_desc();
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<link rel="canonical" href={localizeHref(`${env.PUBLIC_PLAY_URL}/credits`)} />
</svelte:head>

<TypicalPage>
	<div class="page">
		<header class="hero">
			<h1>{title}</h1>
			<p class="tagline">{description}</p>
		</header>

		<section>
			<h2 class="section-title">{m.core_team()}</h2>
			<ul class="people">
				<li>
					<Card href="https://adhami.me" padding="1em 0.7em" gap="0.4em" class="person">
						<img src={khaleel} alt={m.person_avatar({ name: 'Khaleel Al-Adhami' })} />
						<div class="name"><!-- i18n-ignore -->Khaleel Al-Adhami</div>
						<div class="role">
							<ComputerOutline height="0.9em" width="0.9em" />
							<span>{m.developer()}</span>
						</div>
					</Card>
				</li>
				<li>
					<Card href="https://www.linkedin.com/in/yichen-gao/" padding="1em 0.7em" gap="0.4em" class="person">
						<img src={yichen} alt={m.person_avatar({ name: 'Yichen Gao' })} />
						<div class="name"><!-- i18n-ignore -->Yichen Gao</div>
						<div class="role">
							<MailOutline height="0.9em" width="0.9em" />
							<span>{m.community_lead()}</span>
						</div>
					</Card>
				</li>
				<li>
					<Card href="https://barish.me/" padding="1em 0.7em" gap="0.4em" class="person">
						<img src={barish} alt={m.person_avatar({ name: 'Abutalib (Barish) Namazov' })} />
						<div class="name"><!-- i18n-ignore -->Abutalib (Barish) Namazov</div>
						<div class="role">
							<ComputerOutline height="0.9em" width="0.9em" />
							<span>{m.developer()}</span>
						</div>
					</Card>
				</li>
				<li>
					<Card href="mailto:sebastian@wichematik.education" padding="1em 0.7em" gap="0.4em" class="person">
						<img src={sebastian} alt={m.person_avatar({ name: 'Sebastian Wich' })} />
						<div class="name"><!-- i18n-ignore -->Sebastian Wich</div>
						<div class="role">
							<MailOutline height="0.9em" width="0.9em" />
							<span>{m.community_lead()}</span>
						</div>
					</Card>
				</li>
			</ul>
		</section>

		<section>
			<h2 class="section-title">{m.contributors()}</h2>
			<ul class="contributors">
				<li>
					<Card href="https://bragefuglseth.dev/" padding="0.6em 0.8em" gap="0.7em" class="contrib">
						<span class="contrib-icon"><BrushOutline height="1em" width="1em" /></span>
						<span class="contrib-body">
							<span class="contrib-name"><!-- i18n-ignore -->Brage Fuglseth</span>
							<span class="contrib-role">{m.designer()}</span>
						</span>
					</Card>
				</li>
				<li>
					<Card href="https://www.linkedin.com/in/zhironwu/" padding="0.6em 0.8em" gap="0.7em" class="contrib">
						<span class="contrib-icon"><Language height="1em" width="1em" /></span>
						<span class="contrib-body">
							<span class="contrib-name"><!-- i18n-ignore -->Zhiron Wu</span>
							<span class="contrib-role">{m.translator()}</span>
						</span>
					</Card>
				</li>
			</ul>
		</section>

		<section>
			<h2 class="section-title">{m.music()}</h2>
			<ul class="contributors">
				<li>
					<Card href="https://incompetech.com/wordpress/" padding="0.6em 0.8em" gap="0.7em" class="contrib">
						<span class="contrib-icon"><AlbumOutline height="1em" width="1em" /></span>
						<span class="contrib-body">
							<span class="contrib-name"><!-- i18n-ignore -->Kevin MacLeod</span>
							<span class="contrib-role">
								<!-- i18n-ignore -->
								"Thinking Music" · Licensed under Creative Commons BY 4.0
							</span>
						</span>
					</Card>
				</li>
				<li>
					<Card
						href="https://www.youtube.com/watch?v=_h47TNIKJYo&pp=ygUHIGJlZS4gMw%3D%3D"
						padding="0.6em 0.8em"
						gap="0.7em"
						class="contrib"
					>
						<span class="contrib-icon"><AlbumOutline height="1em" width="1em" /></span>
						<span class="contrib-body">
							<span class="contrib-name"><!-- i18n-ignore -->GroovyDominoes52</span>
							<span class="contrib-role"><!-- i18n-ignore -->"bee. 3"</span>
						</span>
					</Card>
				</li>
			</ul>
		</section>
	</div>
</TypicalPage>

<style>
	.page {
		max-width: 80ch;
		margin: 0 auto;
		padding: 0 1em 2em;
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
		padding: 2em 0 0.5em;
		text-align: center;
	}

	.hero h1 {
		margin: 0;
		font-family: var(--alternative-font);
		font-size: clamp(1.8em, 4vw, 2.5em);
		line-height: 1.1;
	}

	.tagline {
		margin: 0;
		max-width: 50ch;
		opacity: 0.7;
		line-height: 1.4;
	}

	.section-title {
		margin: 0 0 0.8em;
		font-family: var(--alternative-font);
		font-size: 1.1em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.65;
		text-align: center;
	}

	.people {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(15ch, 100%), 1fr));
		gap: 0.8em;
	}

	/* A grid item stretches, so each card fills the height of its row. */
	.people li {
		display: grid;
	}

	.people :global(.person) {
		align-items: center;
		text-align: center;
	}

	.people img {
		width: 4.5em;
		height: 4.5em;
		object-fit: contain;
		border-radius: 999px;
		background: white;
		border: 1px solid var(--outline);
	}

	.name {
		font-family: var(--alternative-font);
		font-weight: 600;
		line-height: 1.2;
		font-size: 0.95em;
	}

	.role {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		font-size: 0.8em;
		opacity: 0.7;
		margin-top: auto;
	}

	.contributors {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4em;
		max-width: 50ch;
		width: 100%;
		margin-inline: auto;
	}

	.contributors :global(.contrib) {
		flex-direction: row;
		align-items: flex-start;
	}

	.contrib-icon {
		display: inline-flex;
		color: var(--primary);
		margin-top: 0.15em;
		flex-shrink: 0;
	}

	.contrib-body {
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		min-width: 0;
	}

	.contrib-name {
		font-family: var(--alternative-font);
		font-weight: 600;
		line-height: 1.3;
	}

	.contrib-role {
		font-size: 0.8em;
		opacity: 0.7;
		line-height: 1.3;
		word-break: break-word;
	}
</style>
