<script>
	import * as m from '$lib/paraglide/messages.js';

	import FancyButton from '$lib/ui/FancyButton.svelte';

	/** @type {{
	 * text: string;
	 * topShadow?: boolean;
	 * showNext?: boolean;
	 * heading?: boolean;
	 * onnext?: () => void;
	}}*/
	let { text, topShadow = false, showNext = false, heading = false, onnext } = $props();
</script>

<div
	style:background="var(--background-color)"
	style:display="flex"
	style:line-height="1.2"
	style:align-items="center"
	style:justify-content="center"
	style:padding="0.2em 0.4em"
	style:border-bottom="0.15em solid currentcolor"
	style:border-top={topShadow ? '0.15em solid currentcolor' : ''}
	style:text-align="center"
	style:z-index="1"
>
	<div
		style:flex="1"
		style:font-size="1.5em"
		style:font-weight="bold"
		style:word-break="break-word"
		style:font-family={heading ? 'Poppins' : 'inherit'}
	>
		{text}
	</div>
	{#if showNext}
		<div style:font-size="1.2em" style:font-family="Poppins">
			<FancyButton onclick={onnext}>
				<div style:padding="0.2em 0.4em">{m.next()}</div>
			</FancyButton>
		</div>
	{/if}
</div>
