<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	import * as m from '$lib/paraglide/messages.js';

	let { height = 60 }: { height?: number } = $props();
</script>

<div style:height="100%" style:display="flex" style:aspect-ratio="11/4">
	<div style:margin-right="auto" style:display="flex" style:width="auto" style:height="{height}px">
		<img height="100%" src={logo} alt={m.logo_alt()} />
	</div>
</div>

