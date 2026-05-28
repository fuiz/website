<script lang="ts">
	import { resolve } from '$app/paths';
	import MediaFallback from '$lib/media/MediaFallback.svelte';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	let { data } = $props();
</script>

<a class="tile" href={resolve(localizeHref(`/library/public/${data.storage_id}`))}>
	<div class="media">
		{#if data.thumbnail}
			<img src={data.thumbnail} alt={data.thumbnail_alt} />
		{:else}
			<MediaFallback />
		{/if}
	</div>
	<div class="info" title={data.title}>
		<div class="title">{data.title}</div>
		<div class="author">{data.author}</div>
	</div>
</a>

<style>
	.tile {
		--border-color: color-mix(in srgb, currentColor 20%, transparent);
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border-color);
		border-radius: 0.7em;
		overflow: hidden;
		color: inherit;
		text-decoration: none;
		aspect-ratio: 6 / 5;
		transition:
			border-color 150ms ease-out,
			background 150ms ease-out;
	}

	.tile:where(:hover, :focus-visible) {
		--border-color: var(--primary);
		outline: none;
	}

	.media {
		flex: 1;
		display: flex;
		overflow: hidden;
		background: color-mix(in srgb, currentColor 5%, transparent);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.info {
		padding: 0.4em 0.5em;
		font-size: 0.85em;
	}

	.title {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.author {
		font-size: 0.85em;
		opacity: 0.7;
		margin-top: 0.1em;
	}
</style>
