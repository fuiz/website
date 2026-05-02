<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import FancyButton from '$lib/ui/FancyButton.svelte';

	let {
		text,
		showNext = false,
		heading = false,
		onnext
	}: {
		text: string;
		showNext?: boolean;
		heading?: boolean;
		onnext?: () => void;
	} = $props();
</script>

<div class="bar">
	<div class="text" class:heading>
		{text}
	</div>
	{#if showNext}
		<div class="next">
			<FancyButton onclick={onnext}>
				<div class="next-padding">{m.next()}</div>
			</FancyButton>
		</div>
	{/if}
</div>

<style>
	.bar {
		display: flex;
		line-height: 1.5;
		align-items: center;
		justify-content: center;
		padding: 0.4em 0.6em;
		text-align: center;
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

	.next-padding {
		padding: 0.2em 0.4em;
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
