<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import FancyAnchorButton from '$lib/FancyAnchorButton.svelte';
	import FancyButton from '$lib/FancyButton.svelte';
	import Header from '$lib/Header.svelte';
	import Icon from '$lib/Icon.svelte';
	import LanguageSwitcher from '$lib/LanguageSwitcher.svelte';
	import DarkModeSwitcher from '$lib/DarkModeSwitcher.svelte';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';
</script>

<header>
	<Header />
	<nav style:font-size="0.8em">
		<div>
			<FancyAnchorButton href={'/create'}>
				<div class="a">
					<Icon src="$lib/assets/paint.svg" alt={m.create()} size="1.2em" />
					<div>{m.create()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		<div>
			<FancyAnchorButton href={'/play'}>
				<div class="a">
					<Icon size="1.2em" src="$lib/assets/game.svg" alt={m.play()} />
					<div>{m.play()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		<div>
			<FancyAnchorButton href={'/library'}>
				<div class="a">
					<Icon size="1.2em" src="$lib/assets/library.svg" alt={m.library()} />
					<div>{m.library()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		<div>
			<FancyAnchorButton href={'/posts'}>
				<div class="a">
					<Icon size="1.2em" src="$lib/assets/newspaper.svg" alt={m.blog()} />
					<div>{m.blog()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		<div>
			<FancyAnchorButton href={'https://opencollective.com/fuiz'}>
				<div class="a">
					<Icon size="1.2em" src="$lib/assets/donate.svg" alt={m.donate()} />
					<div>{m.donate()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		{#if page.data.session?.user}
			<div>
				<FancyButton onclick={() => signOut()}>
					<div class="a">
						<Icon size="1.2em" src="$lib/assets/logout.svg" alt={m.logout()} />
						<div>{m.logout()}</div>
					</div>
				</FancyButton>
			</div>
		{:else}
			<div>
				<FancyAnchorButton href={'/signin'}>
					<div class="a">
						<Icon size="1.2em" src="$lib/assets/login.svg" alt={m.login()} />
						<div>{m.login()}</div>
					</div>
				</FancyAnchorButton>
			</div>
		{/if}
		<LanguageSwitcher />
		<DarkModeSwitcher />
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3em 0.6em;

		@media (max-width: 600px) {
			flex-direction: column;
			align-items: stretch;
		}

		gap: 0.3em;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.3em;
	}

	nav > div {
		flex: 1;
	}

	.a {
		display: flex;
		font-family: 'Poppins';
		white-space: nowrap;
		align-items: center;
		justify-content: center;
		gap: 0.2em;
		padding: 0.2em;
	}
</style>
