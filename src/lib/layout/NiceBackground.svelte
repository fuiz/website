<script>
	import blueberry from '$lib/assets/icons/blueberry.svg';
	import kiwi from '$lib/assets/icons/kiwi.svg';
	import orange from '$lib/assets/icons/orange.svg';
	import strawberry from '$lib/assets/icons/strawberry.svg';
	import * as m from '$lib/paraglide/messages.js';

	let { children } = $props();
</script>

<div style:height="100%" style:position="relat ive">
	<div
		style:background-color="var(--background-color)"
		style:inset="0"
		style:position="absolute"
		style:overflow="hidden"
		style:z-index="-1"
	>
		<div style:height="100%" style:width="100%">
			<div style:display="flex" style:flex-wrap="wrap" style:opacity="20%" style:height="100%">
				<div class="card-container" style:transform="scale(1) translate(0%, 0%) rotate(0.0625turn)">
					<img src={strawberry} alt={m.strawberry()} />
				</div>
				<div
					class="card-container"
					style:transform="scale(1) translate(0%, -25%) rotate(-0.0625turn)"
				>
					<img src={blueberry} alt={m.blueberries()} />
				</div>
				<div
					class="card-container"
					style:transform="scale(1) translate(-25%, 12.5%) rotate(-0.0625turn)"
				>
					<img src={kiwi} alt={m.kiwi()} />
				</div>
				<div
					class="card-container"
					style:transform="scale(1) translate(12.5%, -25%) rotate(0.0625turn)"
				>
					<img src={orange} alt={m.orange()} />
				</div>
			</div>
		</div>
	</div>
	<div style:height="100%">
		{@render children?.()}
	</div>
</div>

<style>
	.card-container {
		height: 50%;
		width: 50%;
	}

	.card-container img {
		height: 100%;
		width: 100%;
	}
</style>
