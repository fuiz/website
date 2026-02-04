<script>
	/** @type {{ borderWidth?: number }} */
	let { borderWidth = 4 } = $props();
</script>

<div style:--border-width="{borderWidth}px"></div>

<style>
	div {
		box-sizing: border-box;
		border: var(--border-width) solid;
		border-radius: 50%;
		border-top: var(--border-width) solid transparent;
		width: 100%;
		height: 100%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
