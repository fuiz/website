<script>
	import Icon from '$lib/media/Icon.svelte';

	/** @type {{
	 * message: string;
	 * image: { src: string; alt: string };
	 * background: string;
	 * color?: string;
	 * href: string;
	}}*/
	let { message, image, background, color = 'inherit', href } = $props();
</script>

{#if message}
	<a {href} style:--background={background} style:--color={color}>
		<Icon size="1em" src={image.src} alt={image.alt} />
		<div style:flex="1" style:text-align="center">
			{message}
		</div>
	</a>
{/if}

<style>
	a {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 5px 10px;
		box-sizing: border-box;
		border-radius: 5px;
		gap: 10px;
		background: var(--background);
		color: var(--color);
		font-weight: bold;
		word-wrap: anywhere;
	}
</style>
