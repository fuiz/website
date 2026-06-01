<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from '$lib/media/Logo.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<div class="row">
	<a class="link" href={resolve(localizeHref('/'))}>
		<Logo height={40} />
	</a>
</div>

<style>
	.row {
		display: flex;
		justify-content: center;
	}

	.link {
		height: 40px;
		overflow: hidden;
		color: inherit;
	}
</style>
