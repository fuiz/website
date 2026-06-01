<script lang="ts">
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import LoadingCircle from './LoadingCircle.svelte';
</script>

<div class="root">
	<div class="fill">
		<NiceBackground>
			<div class="center">
				<div class="spinner">
					<LoadingCircle borderWidth={8} />
				</div>
			</div>
		</NiceBackground>
	</div>
</div>

<style>
	.root {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.fill {
		flex: 1;
	}

	.center {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.spinner {
		height: 40px;
		width: 40px;
	}
</style>
