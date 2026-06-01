<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	import * as m from '$lib/paraglide/messages.js';

	let { height = 60 }: { height?: number } = $props();
</script>

<div class="outer">
	<div class="inner" style:--h="{height}px">
		<img height="100%" src={logo} alt={m.logo_alt()} />
	</div>
</div>

<style>
	.outer {
		height: 100%;
		display: flex;
		aspect-ratio: 11 / 4;
	}

	.inner {
		margin-right: auto;
		display: flex;
		width: auto;
		height: var(--h);
	}
</style>
