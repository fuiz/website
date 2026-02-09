<script>
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import barish from '$lib/assets/people/Barish.webp';
	import khaleel from '$lib/assets/people/Khaleel.webp';
	import sebastian from '$lib/assets/people/Sebastian.webp';
	import yichen from '$lib/assets/people/Yichen.webp';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import AnchorMessage from '$lib/navigation/AnchorMessage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
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
	<link rel="canonical" href={localizeHref(`${PUBLIC_PLAY_URL}/credits`)} />
</svelte:head>

<TypicalPage>
	<div
		style:height="100%"
		style:display="flex"
		style:flex-direction="column"
		style:gap="5px"
		style:justify-content="center"
		style:align-items="center"
		style:font-size="0.75em"
		style:margin="auto"
	>
		<section style:width="100%">
			<h2
				style:margin="0.5em 0"
				style:padding="0"
				style:text-align="center"
				style:font-family="Poppins"
				style:font-size="1.25em"
			>
				{m.core_team()}
			</h2>
			<ul id="core-team">
				<li>
					<img src={khaleel} alt={m.person_avatar({ name: 'Khaleel Al-Adhami' })} />
					<div>
						<AnchorMessage
							href="https://adhami.me"
							background="#23456740"
							message="Khaleel Al-Adhami"
						>
							{#snippet icon()}<ComputerOutline height="1em" title={m.developer()} />{/snippet}
						</AnchorMessage>
					</div>
				</li>
				<li>
					<img src={yichen} alt={m.person_avatar({ name: 'Yichen Gao' })} />
					<div>
						<AnchorMessage
							href="https://www.linkedin.com/in/yichen-gao/"
							background="#23456740"
							message="Yichen Gao"
						>
							{#snippet icon()}<MailOutline height="1em" title={m.community_lead()} />{/snippet}
						</AnchorMessage>
					</div>
				</li>
				<li>
					<img src={barish} alt={m.person_avatar({ name: 'Abutalib (Barish) Namazov' })} />
					<div>
						<AnchorMessage
							href="https://barish.me/"
							background="#23456740"
							message="Abutalib (Barish) Namazov"
						>
							{#snippet icon()}<ComputerOutline height="1em" title={m.developer()} />{/snippet}
						</AnchorMessage>
					</div>
				</li>
				<li>
					<img src={sebastian} alt={m.person_avatar({ name: 'Sebastian Wich' })} />
					<div>
						<AnchorMessage
							href="https://sebastianwich.com"
							background="#23456740"
							message="Sebastian Wich"
						>
							{#snippet icon()}<MailOutline height="1em" title={m.community_lead()} />{/snippet}
						</AnchorMessage>
					</div>
				</li>
			</ul>
		</section>
		<section
			style:display="flex"
			style:gap="5px"
			style:flex-direction="column"
			style:justify-content="center"
			style:align-items="center"
			style:width="100%"
			style:max-width="40ch"
		>
			<h2
				style:margin="0.5em 0"
				style:padding="0"
				style:text-align="center"
				style:font-family="Poppins"
				style:font-size="1.25em"
			>
				{m.contributors()}
			</h2>
			<AnchorMessage
				href="https://bragefuglseth.dev/"
				background="#23456740"
				message="Brage Fuglseth"
			>
				{#snippet icon()}<BrushOutline height="1em" title={m.designer()} />{/snippet}
			</AnchorMessage>
			<AnchorMessage
				href="https://www.linkedin.com/in/zhironwu/"
				background="#23456740"
				message="Zhiron Wu"
			>
				{#snippet icon()}<Language height="1em" title={m.translator()} />{/snippet}
			</AnchorMessage>
			<AnchorMessage
				href="https://incompetech.com/wordpress/"
				background="#23456740"
				message="&quot;Thinking Music&quot; Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License. http://creativecommons.org/licenses/by/4.0/"
			>
				{#snippet icon()}<AlbumOutline height="1em" title={m.music()} />{/snippet}
			</AnchorMessage>
			<AnchorMessage
				href="https://www.youtube.com/watch?v=_h47TNIKJYo&pp=ygUHIGJlZS4gMw%3D%3D"
				background="#23456740"
				message="&quot;bee. 3&quot; GroovyDominoes52. can use in your videos or games but always remember to credit and not steal"
			>
				{#snippet icon()}<AlbumOutline height="1em" title={m.music()} />{/snippet}
			</AnchorMessage>
		</section>
	</div>
</TypicalPage>

<style>
	#core-team {
		max-width: min(80ch, 100%);
		justify-content: center;
		margin: 0 auto;
		padding-inline-start: 0;

		display: grid;

		grid-template-columns: repeat(4, 300px);

		@media screen and (max-width: 1200px) {
			grid-template-columns: repeat(3, 1fr);
		}

		@media screen and (max-width: 800px) {
			grid-template-columns: repeat(2, 1fr);
		}

		gap: 5px;

		& li {
			display: flex;
			gap: 5px;
			flex-direction: column;
			justify-content: start;

			& img {
				width: 100%;
				aspect-ratio: 1;
				box-sizing: border-box;
				background: white;
				border: 0.2em solid var(--accent-color);
				object-fit: contain;
				border-radius: 0.5em;
			}
		}
	}
</style>
