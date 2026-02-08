<script>
	import { buttonColors, buttonSymbols } from '$lib/clientOnly';
	import FancyButton from '$lib/ui/FancyButton.svelte';

	/** @type {{index: number, onclick?: () => void}} */
	let { index, onclick } = $props();

	let buttonSymbol = $derived(buttonSymbols[index % buttonColors.length]);
</script>

<div>
	<FancyButton
		{onclick}
		backgroundColor={buttonColors.at(index % buttonColors.length)?.at(0)}
		backgroundDeepColor={buttonColors.at(index % buttonColors.length)?.at(1)}
		height="100%"
	>
		<div
			style:height="100%"
			style:width="100%"
			style:min-height="1.5em"
			style:display="flex"
			style:align-items="center"
			style:justify-content="center"
		>
			<div
				style:aspect-ratio="1"
				style:max-height="65%"
				style:max-width="65%"
				style:display="flex"
				style:align-items="center"
				style:height="100%"
			>
				<buttonSymbol.icon title={buttonSymbol.label} height="100%" width="100%" />
			</div>
		</div>
	</FancyButton>
</div>
