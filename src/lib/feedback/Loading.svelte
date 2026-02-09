<script>
	import NiceBackground from '$lib/layout/NiceBackground.svelte';
	import LoadingCircle from './LoadingCircle.svelte';
</script>

<div style:height="100%" style:display="flex" style:flex-direction="column">
	<div style:flex="1">
		<NiceBackground>
			<div
				style:height="100%"
				style:display="flex"
				style:justify-content="center"
				style:align-items="center"
			>
				<div style:height="40px" style:width="40px">
					<LoadingCircle borderWidth={8} />
				</div>
			</div>
		</NiceBackground>
	</div>
</div>
