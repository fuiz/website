<script>
	import * as m from '$lib/paraglide/messages.js';

	import khaleel from '$lib/assets/people/Khaleel.webp';
	import barish from '$lib/assets/people/Barish.webp';
	import yichen from '$lib/assets/people/Yichen.webp';
	import sebastian from '$lib/assets/people/Sebastian.webp';

	import computer from '$lib/assets/computer.svg';
	import people from '$lib/assets/email.svg';
	import translator from '$lib/assets/language.svg';
	import brush from '$lib/assets/brush.svg';
	import music from '$lib/assets/album.svg';
	import AnchorMessage from '$lib/navigation/AnchorMessage.svelte';
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import TypicalPage from '$lib/layout/TypicalPage.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

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
				Core Team
			</h2>
			<ul id="core-team">
				<li>
					<img src={khaleel} alt="Khaleel Al-Adhami Avatar" />
					<div>
						<AnchorMessage
							href="https://adhami.me"
							image={{ src: computer, alt: m.developer() }}
							background="#23456740"
							message="Khaleel Al-Adhami"
						/>
					</div>
				</li>
				<li>
					<img src={yichen} alt="Yichen Gao Avatar" />
					<div>
						<AnchorMessage
							href="https://www.linkedin.com/in/yichen-gao/"
							image={{ src: people, alt: 'Community Lead' }}
							background="#23456740"
							message="Yichen Gao"
						/>
					</div>
				</li>
				<li>
					<img src={barish} alt="Abutalib (Barish) Namazov Avatar" />
					<div>
						<AnchorMessage
							href="https://barish.me/"
							image={{ src: computer, alt: m.developer() }}
							background="#23456740"
							message="Abutalib (Barish) Namazov"
						/>
					</div>
				</li>
				<li>
					<img src={sebastian} alt="Sebastian Wich Avatar" />
					<div>
						<AnchorMessage
							href="https://sebastianwich.com"
							image={{ src: people, alt: 'Community Lead' }}
							background="#23456740"
							message="Sebastian Wich"
						/>
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
				Contributors
			</h2>
			<AnchorMessage
				href="https://bragefuglseth.dev/"
				image={{ src: brush, alt: m.designer() }}
				background="#23456740"
				message="Brage Fuglseth"
			/>
			<AnchorMessage
				href="https://www.linkedin.com/in/zhironwu/"
				image={{ src: translator, alt: 'Translator' }}
				background="#23456740"
				message="Zhiron Wu"
			/>
			<AnchorMessage
				href="https://incompetech.com/wordpress/"
				image={{ src: music, alt: m.music() }}
				background="#23456740"
				message="&quot;Thinking Music&quot; Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License. http://creativecommons.org/licenses/by/4.0/"
			/>
			<AnchorMessage
				href="https://www.youtube.com/watch?v=_h47TNIKJYo&pp=ygUHIGJlZS4gMw%3D%3D"
				image={{ src: music, alt: m.music() }}
				background="#23456740"
				message="&quot;bee. 3&quot; GroovyDominoes52. can use in your videos or games but always remember to credit and not steal"
			/>
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
