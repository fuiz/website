<script lang="ts">
	import { buttonColors, buttonSymbols } from '$lib/clientOnly';
	import FancyButton from '$lib/ui/FancyButton.svelte';
	import Check from '~icons/custom/check';

	let {
		index,
		selected = false,
		onclick
	}: {
		index: number;
		selected?: boolean;
		onclick?: () => void;
	} = $props();

	let buttonSymbol = $derived(buttonSymbols[index % buttonColors.length]);
</script>

<div class="wrapper">
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
	{#if selected}
		<div
			class="badge"
			style:background={buttonColors.at(index % buttonColors.length)?.at(0)}
			style:border-color={buttonColors.at(index % buttonColors.length)?.at(1)}
		>
			<Check height="100%" width="100%" />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		position: relative;
		height: 100%;
	}

	.badge {
		position: absolute;
		top: -0.4em;
		inset-inline-end: -0.4em;
		height: 2em;
		width: 2em;
		border-radius: 50%;
		border: 0.1em solid;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0em;
		box-sizing: border-box;
		pointer-events: none;
	}
</style>
