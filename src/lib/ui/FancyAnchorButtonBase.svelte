<script>
	import { resolve } from '$app/paths';

	/** @type {{
	 * foregroundColor: string;
	 * backgroundColor: string;
	 * backgroundDeepColor: string;
	 * href: string;
	 * children?: import('svelte').Snippet;
	 * download?: any;
	}}*/
	let { foregroundColor, backgroundColor, backgroundDeepColor, href, children, download } =
		$props();
</script>

<a
	href={resolve(href)}
	{download}
	style:display="flex"
	style:background="none"
	style:border="none"
	style:text-decoration="none"
	style:box-sizing="border-box"
	style:padding="0.3em 0 0 0"
	style:width="100%"
	style:height="fit-content"
	style:font="inherit"
	style:outline="none"
>
	<div
		style:background={backgroundDeepColor}
		style:border-radius="0.7em"
		style:transform="translateY(0)"
		style:width="100%"
		style:height="100%"
	>
		<div
			class="front"
			style:background={backgroundColor}
			style:border="0.1em solid {backgroundDeepColor}"
			style:border-radius="0.7em"
			style:box-sizing="border-box"
			style:color={foregroundColor}
			style:width="100%"
			style:height="100%"
		>
			{@render children?.()}
		</div>
	</div>
</a>

<style>
	a .front {
		transform: translateY(-0.15em);
		transition: transform 150ms;
	}

	a:active:not(:disabled) .front {
		transform: translateY(0em);
	}

	a:where(:global(:hover, :focus)) .front {
		transform: translateY(-0.3em);
	}
</style>
