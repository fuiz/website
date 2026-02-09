<script>
	import { page } from '$app/state';
	import { PUBLIC_PLAY_URL } from '$env/static/public';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Join from './Join.svelte';
	import Play from './Play.svelte';

	let code = $derived(page.url.searchParams.get('code'));

	const title = m.play_title();
	const description = m.play_desc();
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
	<meta property="og:description" content={description} />
	<link rel="canonical" href={localizeHref(`${PUBLIC_PLAY_URL}/play`)} />
</svelte:head>

{#if code !== null}
	<div style:display="contents" style:font-size="0.75em">
		<Play {code} />
	</div>
{:else}
	<Join />
{/if}
