<script>
	import Logo from '$lib/media/Logo.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { resolve } from '$app/paths';
</script>

<div style:display="flex" style:justify-content="center">
	<a
		href={resolve(localizeHref('/'))}
		style:height="60px"
		style:overflow="hidden"
		style:color="inherit"
	>
		<Logo height={60} />
	</a>
</div>
