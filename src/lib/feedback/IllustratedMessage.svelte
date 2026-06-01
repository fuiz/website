<script lang="ts">
	let {
		src,
		alt,
		captionMaxWidth = '10ch',
		children
	}: {
		src: string;
		alt: string;
		captionMaxWidth?: string;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="container">
	<img class="image" {src} {alt} />
	<div class="caption" style:--cap-max={captionMaxWidth}>
		{@render children()}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.image {
		width: 10em;
	}

	.caption {
		font-weight: bold;
		text-align: center;
		max-width: var(--cap-max);
	}
</style>
