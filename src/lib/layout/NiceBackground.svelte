<script>
	import blueberry from '$lib/assets/icons/blueberry.svg';
	import kiwi from '$lib/assets/icons/kiwi.svg';
	import orange from '$lib/assets/icons/orange.svg';
	import strawberry from '$lib/assets/icons/strawberry.svg';
	import * as m from '$lib/paraglide/messages.js';

	let { children } = $props();
</script>

<div class="root">
	<div class="backdrop">
		<div class="pattern">
			<div class="card-container strawberry">
				<img src={strawberry} alt={m.strawberry()} />
			</div>
			<div class="card-container blueberry">
				<img src={blueberry} alt={m.blueberries()} />
			</div>
			<div class="card-container kiwi">
				<img src={kiwi} alt={m.kiwi()} />
			</div>
			<div class="card-container orange">
				<img src={orange} alt={m.orange()} />
			</div>
		</div>
	</div>
	<div class="content">
		{@render children?.()}
	</div>
</div>

<style>
	.root {
		height: 100%;
		position: relative;
	}

	.backdrop {
		background-color: var(--surface);
		inset: 0;
		position: absolute;
		overflow: hidden;
		z-index: -1;
	}

	.pattern {
		display: flex;
		flex-wrap: wrap;
		opacity: 8%;
		height: 100%;
		width: 100%;
	}

	.content {
		height: 100%;
	}

	.card-container {
		height: 50%;
		width: 50%;
	}

	.card-container img {
		height: 100%;
		width: 100%;
	}

	.strawberry {
		transform: scale(1) translate(0%, 0%) rotate(0.0625turn);
	}

	.blueberry {
		transform: scale(1) translate(0%, -25%) rotate(-0.0625turn);
	}

	.kiwi {
		transform: scale(1) translate(-25%, 12.5%) rotate(-0.0625turn);
	}

	.orange {
		transform: scale(1) translate(12.5%, -25%) rotate(0.0625turn);
	}
</style>
