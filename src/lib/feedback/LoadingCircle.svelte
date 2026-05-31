<script lang="ts">
	let { borderWidth = 4 }: { borderWidth?: number } = $props();
</script>

<svg style:--border-width="{borderWidth}px" aria-hidden="true">
	<circle fill="none" stroke="currentColor" pathLength="100" stroke-dasharray="75 25" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	circle {
		cx: 50%;
		cy: 50%;
		r: calc(50% - var(--border-width) / 2);
		stroke-width: var(--border-width);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			stroke-dashoffset: -100;
		}
	}
</style>
