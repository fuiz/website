<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		foregroundColor,
		backgroundColor,
		backgroundDeepColor,
		href,
		children,
		download
	}: {
		foregroundColor: string;
		backgroundColor: string;
		backgroundDeepColor: string;
		href: string;
		children?: Snippet;
		download?: unknown;
	} = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
	{href}
	{download}
	class="root"
	style:--bg={backgroundColor}
	style:--bg-deep={backgroundDeepColor}
	style:--fg={foregroundColor}
>
	<div class="back">
		<div class="front">
			{@render children?.()}
		</div>
	</div>
</a>
<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	.root {
		display: flex;
		background: none;
		border: none;
		text-decoration: none;
		box-sizing: border-box;
		padding: 0.3em 0 0 0;
		width: 100%;
		height: fit-content;
		font: inherit;
		outline: none;
	}

	.back {
		background: var(--bg-deep);
		border-radius: 0.7em;
		transform: translateY(0);
		width: 100%;
		height: 100%;
	}

	.front {
		background: var(--bg);
		border: 0.1em solid var(--bg-deep);
		border-radius: 0.7em;
		box-sizing: border-box;
		color: var(--fg);
		width: 100%;
		height: 100%;
		transform: translateY(-0.15em);
		transition: transform 150ms;
	}

	.root:active:not(:disabled) .front {
		transform: translateY(0);
	}

	.root:where(:global(:hover, :focus)) .front {
		transform: translateY(-0.3em);
	}
</style>
