<script>
	import { resolve } from '$app/paths';
	import Header from '$lib/layout/Header.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import FancyAnchorButton from '$lib/ui/FancyAnchorButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import LibraryBooks from '~icons/material-symbols/library-books';
	import Palette from '~icons/material-symbols/palette';
	import StadiaController from '~icons/material-symbols/stadia-controller';
	import VolunteerActivism from '~icons/material-symbols/volunteer-activism';

	let { showLibrary = false } = $props();
</script>

<header>
	<Header />
	<nav style:font-size="0.8em">
		<div>
			<FancyAnchorButton href={resolve(localizeHref('/create'))}>
				<div class="a">
					<Palette height="1.2em" title={m.create()} />
					<div>{m.create()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		<div>
			<FancyAnchorButton href={resolve(localizeHref('/play'))}>
				<div class="a">
					<StadiaController height="1.2em" title={m.play()} />
					<div>{m.play()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		{#if showLibrary}
			<div>
				<FancyAnchorButton href={resolve(localizeHref('/library'))}>
					<div class="a">
						<LibraryBooks height="1.2em" title={m.library()} />
						<div>{m.library()}</div>
					</div>
				</FancyAnchorButton>
			</div>
		{/if}
		<div>
			<FancyAnchorButton href="https://opencollective.com/fuiz">
				<div class="a">
					<VolunteerActivism height="1.2em" title={m.donate()} />
					<div>{m.donate()}</div>
				</div>
			</FancyAnchorButton>
		</div>
		<LanguageSwitcher id="mainheader" />
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
		font-family: var(--alternative-font);
		white-space: nowrap;
		align-items: center;
		justify-content: center;
		gap: 0.2em;
		padding: 0.2em;
	}
</style>
