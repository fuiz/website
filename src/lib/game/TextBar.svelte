<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import FancyButton from '$lib/ui/FancyButton.svelte';
	import FitText from '$lib/ui/FitText.svelte';

	let {
		text,
		showNext = false,
		heading = false,
		fit = false,
		onnext
	}: {
		text: string;
		showNext?: boolean;
		heading?: boolean;
		/**
		 * Shrink long text to fit a share of the nearest size container: its full width and
		 * `--text-bar-height` of its height (default 35cqh). Short text stays at full size.
		 */
		fit?: boolean;
		onnext?: () => void;
	} = $props();
</script>

<div class="bar">
	<div class="text" class:heading class:fit>
		{#if fit}
			<FitText {text} contained={false} />
		{:else}
			{text}
		{/if}
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

	/* Never larger than the regular size, down to about half of it. The width allows for
	   the bar's padding; em here is resolved against .text's own size. Running a line
	   over only makes the bar taller, so the estimate can be less cautious than for tiles. */
	.text.fit {
		--fit-advance: 0.5;
		--fit-slack: 0.5;
		--fit-width: calc(100cqw - 1em);
		--fit-height: var(--text-bar-height, 35cqh);
		--fit-min: 0.55em;
		--fit-max: 1em;
		--fit-line-height: 1.3;
	}

	.text.heading {
		font-family: var(--alternative-font);
	}

	.next {
		font-size: 1.2em;
		font-family: var(--alternative-font);
		margin-inline-start: 0.6em;
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
