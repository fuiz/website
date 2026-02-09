<script>
	import { buttonColors, buttonSymbols } from '$lib/clientOnly';

	/** @type {{ statistics?: { count: number; correct: boolean }[] }}*/
	let { statistics = [] } = $props();

	let maximum = $derived(statistics.reduce((a, b) => (a > b.count ? a : b.count), 0));
</script>

<div
	style:display="flex"
	style:padding="1em"
	style:max-height="15em"
	style:gap="0.7em"
	style:height="100%"
	style:box-sizing="border-box"
>
	{#each statistics as { count, correct }, index (index)}
		{@const buttonSymbol = buttonSymbols[index % buttonColors.length]}
		<div
			style:display="flex"
			style:flex-direction="column-reverse"
			style:gap="0.2em"
			style:height="100%"
			style:opacity={correct ? 1 : 0.5}
		>
			<div
				style:display="flex"
				style:justify-content="center"
				style:border-radius="0.7em"
				style:color="var(--palette-light)"
				style:padding="0.3em 0.8em"
				style:background={buttonColors.at(index % buttonColors.length)?.at(0)}
				style:border="0.15em solid {buttonColors.at(index % buttonColors.length)?.at(1)}"
			>
				<buttonSymbol.icon title={buttonSymbol.label} height="1em" width="1em" />
			</div>
			<div style:display="flex" style:flex-direction="column-reverse" style:height="100%">
				<div
					style:background={buttonColors.at(index % buttonColors.length)?.at(0)}
					style:border="0.15em solid {buttonColors.at(index % buttonColors.length)?.at(1)}"
					style:border-radius="0.7em"
					style:height="max(1em, calc((100% - 2em) * {maximum === 0 ? 0 : count / maximum}))"
				></div>
				<div
					style:display="flex"
					style:justify-content="center"
					style:color={buttonColors.at(index % buttonColors.length)?.at(0)}
					style:font-family="Poppins"
				>
					{count}
				</div>
			</div>
		</div>
	{/each}
</div>
