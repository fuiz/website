<script>
	/** @type {{data: import('$lib/types').PublishedFuiz;}} */
	let { data } = $props();
</script>

<a class="container" href="library/public/{data.storage_id}">
	<div class="image-container">
		{#if data.thumbnail}
			<img src={data.thumbnail} alt={data.thumbnail_alt} />
		{/if}
	</div>
	<div class="info" title={data.title}>
		<div class="title">
			{data.title}
		</div>
		<div class="little">
			{data.author}
		</div>
	</div>
</a>

<style>
	.container {
		color: inherit;
		text-decoration: none;
		border: 0.15em solid;
		border-radius: 0.7em;
		max-width: 20ch;
		overflow: hidden;
		background: var(--background-color);
	}

	.image-container {
		height: 8em;
		flex: 1;
		overflow: hidden;
		display: flex;
		border-bottom: 0.15em solid;
	}

	img {
		width: 100%;
		height: auto;
		flex: 1;
		object-fit: contain;
	}

	.info {
		padding: 0.25em;
		font-size: 0.8em;
	}

	.title {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.little {
		font-size: 0.6em;
		margin: 0.25em 0;
	}
</style>
