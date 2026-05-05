<script lang="ts">
	import logo from '$lib/assets/same_color_logo.svg';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="fallback">
	<img src={logo} alt={m.fallback()} />
</div>

<style>
	.fallback {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.25;
		padding: 25%;
		box-sizing: border-box;
	}

	.fallback img {
		max-height: 100%;
		max-width: 100%;
		object-fit: contain;
	}
</style>
