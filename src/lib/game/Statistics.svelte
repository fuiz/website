<script>
	import { buttonColors, buttonSymbols } from '$lib/clientOnly';

	/** @type {{ statistics?: { count: number; correct: boolean }[] }}*/
	let { statistics = [] } = $props();

	let maximum = $derived(statistics.reduce((a, b) => (a > b.count ? a : b.count), 0));
</script>

<div class="stats">
	{#each statistics as { count, correct }, index (index)}
		{@const buttonSymbol = buttonSymbols[index % buttonColors.length]}
		<div class="bar-stack" class:faded={!correct}>
			<div
				class="symbol"
				style:background={buttonColors.at(index % buttonColors.length)?.at(0)}
				style:border="0.15em solid {buttonColors.at(index % buttonColors.length)?.at(1)}"
			>
				<buttonSymbol.icon title={buttonSymbol.label} height="1em" width="1em" />
			</div>
			<div class="bar-fill">
				<div
					class="bar"
					style:background={buttonColors.at(index % buttonColors.length)?.at(0)}
					style:border="0.15em solid {buttonColors.at(index % buttonColors.length)?.at(1)}"
					style:height="max(1em, calc((100% - 2em) * {maximum === 0 ? 0 : count / maximum}))"
				></div>
				<div
					class="count"
					style:color={buttonColors.at(index % buttonColors.length)?.at(0)}
				>
					{count}
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.stats {
		display: flex;
		padding: 1em;
		gap: 0.7em;
		height: 100%;
		box-sizing: border-box;
		font-size: 1.5em;
	}

	.bar-stack {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.2em;
		height: 100%;
		flex: 1;
	}

	.bar-stack.faded {
		opacity: 0.5;
	}

	.symbol {
		display: flex;
		justify-content: center;
		border-radius: 0.7em;
		color: var(--palette-light);
		padding: 0.3em 0.8em;
	}

	.bar-fill {
		display: flex;
		flex-direction: column-reverse;
		height: 100%;
	}

	.bar {
		border-radius: 0.7em;
	}

	.count {
		display: flex;
		justify-content: center;
		font-family: var(--alternative-font);
	}
</style>
