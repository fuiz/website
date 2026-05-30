<script lang="ts">
	let { checked }: { checked: boolean } = $props();
</script>

<div class="container" class:checked>
	<div class="outline"></div>
	<div class="background"></div>
	<svg class="icon" viewBox="0 0 18 18" aria-hidden="true">
		<rect class="mark short" />
		<rect class="mark long" />
	</svg>
</div>

<style>
	.container {
		position: relative;
		width: 1em;
		height: 1em;
		margin: 0.125em;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.outline,
	.background,
	.icon {
		position: absolute;
		inset: 0;
	}

	.outline,
	.background {
		border-radius: inherit;
	}

	.outline {
		border: 2px solid var(--on-surface-variant);
		box-sizing: border-box;
	}

	.background {
		background: var(--primary);
	}

	.icon {
		width: 100%;
		height: 100%;
		fill: var(--on-primary);
	}

	.background,
	.icon {
		opacity: 0;
		transform: scale(0.6);
		transition:
			transform 150ms cubic-bezier(0.3, 0, 0.8, 0.15),
			opacity 50ms linear;
	}

	.container.checked .background,
	.container.checked .icon {
		opacity: 1;
		transform: scale(1);
		transition:
			transform 350ms cubic-bezier(0.05, 0.7, 0.1, 1),
			opacity 50ms linear;
	}

	.mark {
		transform: scaleY(-1) translate(7px, -14px) rotate(45deg);
		transition-duration: 150ms;
		transition-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
	}

	.container.checked .mark {
		transition-duration: 350ms;
		transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);
	}

	.short {
		width: 2px;
		height: 2px;
		transition-property: height;
	}

	.long {
		width: 2px;
		height: 2px;
		transition-property: width;
	}

	.container.checked .short {
		height: 5.657px;
	}

	.container.checked .long {
		width: 11.314px;
	}
</style>
