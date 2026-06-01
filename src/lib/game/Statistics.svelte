<script lang="ts">
	import { buttonSymbols, paletteClass } from '$lib/clientOnly';

	let { statistics = [] }: { statistics?: { count: number; correct: boolean }[] } = $props();

	let maximum = $derived(statistics.reduce((a, b) => (a > b.count ? a : b.count), 0));
</script>

<div class="stats">
	{#each statistics as { count, correct }, index (index)}
		{@const buttonSymbol = buttonSymbols[index % buttonSymbols.length]}
		<div
			class={['bar-stack', paletteClass(index)]}
			class:faded={!correct}
			style:--height-pct={maximum === 0 ? 0 : count / maximum}
		>
			<div class="symbol">
				<buttonSymbol.icon title={buttonSymbol.label} height="1em" width="1em" />
			</div>
			<div class="bar-fill">
				<div class="bar"></div>
				<div class="count">{count}</div>
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
		background: var(--btn-bg);
		border: 0.15em solid var(--btn-deep);
	}

	.bar-fill {
		display: flex;
		flex-direction: column-reverse;
		height: 100%;
	}

	.bar {
		border-radius: 0.7em;
		background: var(--btn-bg);
		border: 0.15em solid var(--btn-deep);
		height: max(1em, calc((100% - 2em) * var(--height-pct)));
	}

	.count {
		display: flex;
		justify-content: center;
		font-family: var(--alternative-font);
		color: var(--btn-bg);
	}
</style>
