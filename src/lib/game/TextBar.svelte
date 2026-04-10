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

<div class="bar" class:top-shadow={topShadow}>
	<div class="text" class:heading>
		{text}
	</div>
	{#if showNext}
		<div class="next">
			<FancyButton onclick={onnext}>
				<div style:padding="0.2em 0.4em">{m.next()}</div>
			</FancyButton>
		</div>
	{/if}
</div>

<style>
	.bar {
		background: var(--surface);
		display: flex;
		line-height: 1.5;
		align-items: center;
		justify-content: center;
		padding: 0.4em 0.6em;
		border-bottom: 0.15em solid currentcolor;
		text-align: center;
		z-index: 1;
	}

	.bar.top-shadow {
		border-top: 0.15em solid currentcolor;
	}

	.text {
		flex: 1;
		font-size: 1.8em;
		font-weight: 500;
		word-break: break-word;
	}

	.text.heading {
		font-family: var(--alternative-font);
	}

	.next {
		font-size: 1.2em;
		font-family: var(--alternative-font);
	}

	@media (max-width: 600px) {
		.bar {
			padding: 0.2em 0.4em;
		}

		.text {
			font-size: 1.5em;
		}

		.next {
			font-size: 1em;
		}
	}
</style>
